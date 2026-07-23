import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import WebView from "react-native-webview";

export type RunResult = {
  success: boolean;
  output: string;
  error?: string;
  seconds?: string;
};

export type PythonRunnerHandle = {
  run: (code: string) => void;
  provideInput: (text: string) => void;
};

type Props = {
  onStream?: (output: string) => void;
  onWaitingForInput?: (prompt: string, output: string) => void;
  onResult: (result: RunResult) => void;
  onReadyChange?: (ready: boolean) => void;
};

// Skulpt is a pure-JS Python interpreter. It runs entirely inside this
// WebView's own isolated JS context — the app never sends code to any
// server, and Skulpt only supports core Python + a small stdlib subset,
// so typed code can never import real system modules or touch the rest
// of the app. execLimit caps runaway loops so a bad `while True:` can't
// freeze the screen. input() is supported interactively — the page pauses
// and asks React Native for a value before resuming.
const RUNNER_HTML = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body>
<script src="https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js"></script>
<script>
  function post(data) { window.ReactNativeWebView.postMessage(JSON.stringify(data)); }

  var outputBuffer = "";
  var pendingResolve = null;
  var startTime = 0;

  function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) {
      throw "File not found: '" + x + "'";
    }
    return Sk.builtinFiles["files"][x];
  }

  function outf(text) {
    outputBuffer += text;
    post({ stream: true, output: outputBuffer });
  }

  window.provideInput = function (text) {
    if (pendingResolve) {
      var r = pendingResolve;
      pendingResolve = null;
      outputBuffer += text + "\\n";
      // Echo the typed value immediately so the sheet shows it without
      // waiting for the script's next print() call.
      post({ stream: true, output: outputBuffer });
      r(text);
    }
  };

  function runPython(code) {
    outputBuffer = "";
    startTime = Date.now();
    Sk.configure({
      output: outf,
      read: builtinRead,
      execLimit: 15000,
      inputfun: function (promptText) {
        if (promptText) outputBuffer += promptText;
        return new Promise(function (resolve) {
          pendingResolve = resolve;
          post({ waitingForInput: true, prompt: promptText || "", output: outputBuffer });
        });
      },
      inputfunTakesPrompt: true,
    });
    Sk.misceval.asyncToPromise(function () {
      return Sk.importMainWithBody("<stdin>", false, code, true);
    }).then(
      function () {
        var seconds = ((Date.now() - startTime) / 1000).toFixed(3);
        post({ success: true, output: outputBuffer.length ? outputBuffer : "(no output)", seconds: seconds });
      },
      function (err) {
        var seconds = ((Date.now() - startTime) / 1000).toFixed(3);
        post({ success: false, output: outputBuffer, error: err.toString(), seconds: seconds });
      }
    );
  }

  window.addEventListener("load", function () {
    post({ ready: true });
  });
</script>
</body>
</html>
`;

const PythonRunner = forwardRef<PythonRunnerHandle, Props>(
  ({ onStream, onWaitingForInput, onResult, onReadyChange }, ref) => {
    const webviewRef = useRef<WebView>(null);
    const [, setReady] = useState(false);

    useImperativeHandle(ref, () => ({
      run: (code: string) => {
        const safeCode = JSON.stringify(code);
        webviewRef.current?.injectJavaScript(`runPython(${safeCode}); true;`);
      },
      provideInput: (text: string) => {
        const safeText = JSON.stringify(text);
        webviewRef.current?.injectJavaScript(`window.provideInput(${safeText}); true;`);
      },
    }));

    return (
      <View style={styles.hidden} pointerEvents="none">
        <WebView
          ref={webviewRef}
          originWhitelist={["*"]}
          source={{ html: RUNNER_HTML }}
          javaScriptEnabled
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.ready) {
                setReady(true);
                onReadyChange?.(true);
                return;
              }
              if (data.stream) {
                onStream?.(data.output);
                return;
              }
              if (data.waitingForInput) {
                onWaitingForInput?.(data.prompt, data.output);
                return;
              }
              onResult(data);
            } catch {
              // ignore malformed messages
            }
          }}
        />
      </View>
    );
  }
);

export default PythonRunner;

const styles = StyleSheet.create({
  hidden: { position: "absolute", width: 1, height: 1, opacity: 0 },
});