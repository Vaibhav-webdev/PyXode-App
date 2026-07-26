import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import type { TestCase } from './interview_data';

export interface RunTestResult {
  id: string;
  passed: boolean;
  actual?: string;
  expected?: string;
  error?: string;
}

export interface RunOutcome {
  results: RunTestResult[];
  stdout: string;
}

export interface PyodideRunnerHandle {
  runTests: (code: string, tests: TestCase[]) => Promise<RunOutcome>;
}

interface Props {
  /** Fired once Pyodide has finished booting inside the WebView */
  onReadyChange?: (ready: boolean) => void;
}

const pyodideHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js"></script>
      </head>
      <body>
        <script>
          var pyodide = null;

          async function initPyodideEngine() {
            try {
              pyodide = await loadPyodide({
                indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
              });

              pyodide.setStdin({
                readline: () => {
                  var res = prompt("Python Input:");
                  return res !== null ? res : "";
                }
              });

              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'READY' }));
            } catch (err) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'ERROR',
                error: 'Pyodide Load Error: ' + err.message
              }));
            }
          }

          initPyodideEngine();
        </script>
      </body>
    </html>
  `;

const RUN_TIMEOUT_MS = 12000;

const PyodideRunner = forwardRef<PyodideRunnerHandle, Props>(({ onReadyChange }, ref) => {
  const [isEngineReady, setIsEngineReady] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const pendingResolve = useRef<((v: RunOutcome) => void) | null>(null);
  const pendingReject = useRef<((e: Error) => void) | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const settle = useCallback((fn: 'resolve' | 'reject', value: RunOutcome | Error) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (fn === 'resolve' && pendingResolve.current) {
      pendingResolve.current(value as RunOutcome);
    } else if (fn === 'reject' && pendingReject.current) {
      pendingReject.current(value as Error);
    }
    pendingResolve.current = null;
    pendingReject.current = null;
  }, []);

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (!data.type) return;

      if (data.type === "READY") {
        setIsEngineReady(true);
        onReadyChange?.(true);
      } else if (data.type === "RESULT") {
        settle('resolve', { results: data.results, stdout: data.stdout ?? '' });
      } else if (data.type === "ERROR") {
        settle('reject', new Error(data.error ?? 'Pyodide error'));
      }
    } catch (e) {
      return;
    }
  };
  useImperativeHandle(
    ref,
    () => ({
      runTests: (code: string, tests: TestCase[]) => {
        return new Promise<RunOutcome>((resolve, reject) => {
          if (!isEngineReady) {
            reject(new Error('Python engine not loaded yet.'));
            return;
          }
          pendingResolve.current = resolve;
          pendingReject.current = reject;
          const jsonCode = JSON.stringify(code)
          const jsonTests = JSON.stringify(JSON.stringify(tests));
          const js = `
  (async function() {
    if (!pyodide) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', error: 'Python engine not loaded yet.' }));
      return;
    }
    try {
      pyodide.globals.set('__user_code__', ${jsonCode});
      pyodide.globals.set('__tests_json__', ${jsonTests});

      const harness = [
        'import json, io, contextlib',
        '__results__ = []',
        '__stdout__ = io.StringIO()',
        '__scope__ = {}',
        '__tests__ = json.loads(__tests_json__)',
        'try:',
        '    with contextlib.redirect_stdout(__stdout__):',
        '        exec(__user_code__, __scope__)',
        'except Exception as e:',
        '    for __t in __tests__:',
        '        __results__.append({"id": __t["id"], "passed": False, "error": type(e).__name__ + ": " + str(e)})',
        'else:',
        '    for __t in __tests__:',
        '        try:',
        '            __actual = eval(__t["call"], __scope__)',
        '            __passed = __actual == __t["expected"]',
        '            __results__.append({"id": __t["id"], "passed": bool(__passed), "actual": repr(__actual), "expected": repr(__t["expected"])})',
        '        except Exception as e:',
        '            __results__.append({"id": __t["id"], "passed": False, "error": type(e).__name__ + ": " + str(e)})',
        'json.dumps({"results": __results__, "stdout": __stdout__.getvalue()})',
      ].join('\\n');

      const resultJson = await pyodide.runPythonAsync(harness);
      const parsed = JSON.parse(resultJson);

      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'RESULT',
        results: parsed.results,
        stdout: parsed.stdout,
      }));
    } catch (err) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', error: err.message }));
    }
  })();
  true;
`;

          webViewRef.current?.injectJavaScript(js);
          timeoutRef.current = setTimeout(() => {
            settle('reject', new Error('Timed out — check for an infinite loop and try again.'));
          }, RUN_TIMEOUT_MS);
        });
      },
    }),
    [settle, isEngineReady]
  );

  return (
    <View style={styles.hidden} pointerEvents="none">
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{
          html: pyodideHtml,
          baseUrl: "https://cdn.jsdelivr.net",
        }}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mixedContentMode="always"
        cacheEnabled={true}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  hidden: { position: 'absolute', top: 0, left: -1000, width: 300, height: 300, opacity: 0 },
});

export default PyodideRunner;