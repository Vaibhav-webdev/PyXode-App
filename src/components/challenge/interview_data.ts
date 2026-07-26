/**
 * interview_data.ts
 * ------------------
 * Data layer for the "Mock Python Interview" Challenges tab.
 *
 * Three question types live in one file:
 *   - bug        → buggy code, user fixes it
 *   - writing    → blank/skeleton code, user writes it
 *   - objective  → multiple choice
 *
 * generateInterviewPack() picks ONE random question of each type and
 * shuffles the order, so every interview run feels different.
 *
 * `hint` / `solution` fields are intentionally defined but NEVER rendered
 * during the interview flow — they're reserved for a future "practice mode".
 */

export type ChallengeType = 'bug' | 'writing' | 'objective';

/** A single test case checked against the student's code inside Pyodide. */
export interface TestCase {
  id: string;
  description: string;
  /** Python expression evaluated against the student's exec()'d scope, e.g. "is_prime(7)" */
  call: string;
  /** Expected value — must be JSON-serializable (number, string, bool, list, null) */
  expected: unknown;
}

interface BaseChallenge {
  id: string;
  type: ChallengeType;
  title: string;
  prompt: string;
  /** Seconds allotted to this single question — summed for the combined timer */
  timeLimit: number;
  xp: number;
  /** Reserved for future practice mode. Never shown during the interview. */
  hint?: string;
  solution?: string;
}

export interface BugFixChallenge extends BaseChallenge {
  type: 'bug';
  buggyCode: string;
  tests: TestCase[];
}

export interface CodeWritingChallenge extends BaseChallenge {
  type: 'writing';
  starterCode: string;
  tests: TestCase[];
}

export interface ObjectiveChallenge extends BaseChallenge {
  type: 'objective';
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export type Challenge = BugFixChallenge | CodeWritingChallenge | ObjectiveChallenge;

// ────────────────────────────────────────────────────────────────
// QUESTION POOLS — add as many as you want, packs pick randomly
// ────────────────────────────────────────────────────────────────

export const bugFixPool: BugFixChallenge[] = [
  {
    id: 'bug-off-by-one',
    type: 'bug',
    title: 'Off-by-One Sum',
    prompt: 'This function should return the sum of all integers from 1 to n (inclusive). Find and fix the bug.',
    timeLimit: 180,
    xp: 40,
    buggyCode: `def sum_first_n(n):
    total = 0
    for i in range(1, n):
        total += i
    return total
`,
    hint: 'range(1, n) stops one short of n.',
    solution: `def sum_first_n(n):
    total = 0
    for i in range(1, n + 1):
        total += i
    return total
`,
    tests: [
      { id: 't1', description: 'sum_first_n(5) should be 15', call: 'sum_first_n(5)', expected: 15 },
      { id: 't2', description: 'sum_first_n(1) should be 1', call: 'sum_first_n(1)', expected: 1 },
      { id: 't3', description: 'sum_first_n(10) should be 55', call: 'sum_first_n(10)', expected: 55 },
    ],
  },
  {
    id: 'bug-mutable-default',
    type: 'bug',
    title: 'The Leaky List',
    prompt: 'add_item should return a fresh list containing just the new item each time it is called without a second argument. Find and fix the bug.',
    timeLimit: 180,
    xp: 45,
    buggyCode: `def add_item(item, items=[]):
    items.append(item)
    return items
`,
    hint: 'Default arguments in Python are evaluated once, not on every call.',
    solution: `def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items
`,
    tests: [
      { id: 't1', description: "add_item('a') should return ['a']", call: "add_item('a')", expected: ['a'] },
      { id: 't2', description: "calling again with add_item('b') should return ['b'], not ['a', 'b']", call: "add_item('b')", expected: ['b'] },
    ],
  },
  {
    id: 'bug-palindrome',
    type: 'bug',
    title: 'Almost a Palindrome Check',
    prompt: 'is_palindrome should check if a string reads the same forwards and backwards. Find and fix the bug.',
    timeLimit: 150,
    xp: 35,
    buggyCode: `def is_palindrome(s):
    return s == s[::-2]
`,
    hint: 'Check the slice step — how do you reverse a string fully?',
    solution: `def is_palindrome(s):
    return s == s[::-1]
`,
    tests: [
      { id: 't1', description: "is_palindrome('racecar') should be True", call: "is_palindrome('racecar')", expected: true },
      { id: 't2', description: "is_palindrome('hello') should be False", call: "is_palindrome('hello')", expected: false },
      { id: 't3', description: "is_palindrome('a') should be True", call: "is_palindrome('a')", expected: true },
    ],
  },
  {
    id: 'bug-return-in-loop',
    type: 'bug',
    title: 'Premature Return',
    prompt: 'get_evens should return a list of all even numbers from the input list. Find and fix the bug.',
    timeLimit: 120,
    xp: 30,
    buggyCode: `def get_evens(nums):
    evens = []
    for n in nums:
        if n % 2 == 0:
            evens.append(n)
            return evens
`,
    hint: 'The return statement is inside the loop, causing it to exit after the first even number.',
    solution: `def get_evens(nums):
    evens = []
    for n in nums:
        if n % 2 == 0:
            evens.append(n)
    return evens
`,
    tests: [
      { id: 't1', description: 'get_evens([1, 2, 3, 4]) should be [2, 4]', call: 'get_evens([1, 2, 3, 4])', expected: [2, 4] },
      { id: 't2', description: 'get_evens([1, 3, 5]) should be []', call: 'get_evens([1, 3, 5])', expected: [] },
    ],
  },
  {
    id: 'bug-list-aliasing',
    type: 'bug',
    title: 'The Cloning Catastrophe',
    prompt: 'clone_and_append should append an item to a copy of the list, leaving the original list unchanged. Find and fix the bug.',
    timeLimit: 150,
    xp: 40,
    buggyCode: `def clone_and_append(lst, item):
    new_list = lst
    new_list.append(item)
    return new_list
`,
    hint: 'Assigning a list to a new variable does not create a copy; it creates a reference.',
    solution: `def clone_and_append(lst, item):
    new_list = lst.copy()
    new_list.append(item)
    return new_list
`,
    tests: [
      { id: 't1', description: 'clone_and_append([1, 2], 3) should be [1, 2, 3]', call: 'clone_and_append([1, 2], 3)', expected: [1, 2, 3] },
    ],
  },
  {
    id: 'bug-integer-division',
    type: 'bug',
    title: 'Half Truth',
    prompt: 'get_half should return an integer representing half of the input number, rounded down. Find and fix the bug.',
    timeLimit: 90,
    xp: 25,
    buggyCode: `def get_half(n):
    return n / 2
`,
    hint: 'The / operator always returns a float in Python 3.',
    solution: `def get_half(n):
    return n // 2
`,
    tests: [
      { id: 't1', description: 'get_half(5) should be 2', call: 'get_half(5)', expected: 2 },
      { id: 't2', description: 'get_half(10) should be 5', call: 'get_half(10)', expected: 5 },
    ],
  },
  {
    id: 'bug-boolean-logic',
    type: 'bug',
    title: 'True or False?',
    prompt: 'is_weekend should return True if the day is Saturday or Sunday. Find and fix the bug.',
    timeLimit: 120,
    xp: 35,
    buggyCode: `def is_weekend(day):
    if day == 'Saturday' or 'Sunday':
        return True
    return False
`,
    hint: "The condition 'Sunday' is always truthy. You need to compare day to it explicitly.",
    solution: `def is_weekend(day):
    if day == 'Saturday' or day == 'Sunday':
        return True
    return False
`,
    tests: [
      { id: 't1', description: "is_weekend('Sunday') should be true", call: "is_weekend('Sunday')", expected: true },
      { id: 't2', description: "is_weekend('Monday') should be false", call: "is_weekend('Monday')", expected: false },
    ],
  },
  {
    id: 'bug-dict-iteration',
    type: 'bug',
    title: 'Value Extractor',
    prompt: 'get_values should return a list of all values from a dictionary. Find and fix the bug.',
    timeLimit: 120,
    xp: 30,
    buggyCode: `def get_values(d):
    result = []
    for k, v in d:
        result.append(v)
    return result
`,
    hint: 'Iterating directly over a dictionary yields its keys, not key-value pairs.',
    solution: `def get_values(d):
    result = []
    for k, v in d.items():
        result.append(v)
    return result
`,
    tests: [
      { id: 't1', description: "get_values({'a': 1, 'b': 2}) should be [1, 2]", call: "get_values({'a': 1, 'b': 2})", expected: [1, 2] },
    ],
  },
  {
    id: 'bug-f-string',
    type: 'bug',
    title: 'Greeting Maker',
    prompt: 'greet should return a greeting string using the provided name. Find and fix the bug.',
    timeLimit: 60,
    xp: 20,
    buggyCode: `def greet(name):
    return "Hello, {name}!"
`,
    hint: 'This is a standard string, not an f-string.',
    solution: `def greet(name):
    return f"Hello, {name}!"
`,
    tests: [
      { id: 't1', description: "greet('Alice') should be 'Hello, Alice!'", call: "greet('Alice')", expected: 'Hello, Alice!' },
    ],
  },
  {
    id: 'bug-modifying-while-iterating',
    type: 'bug',
    title: 'Evens Remover',
    prompt: 'remove_evens should remove all even numbers from a list in place. Find and fix the bug.',
    timeLimit: 180,
    xp: 50,
    buggyCode: `def remove_evens(nums):
    for n in nums:
        if n % 2 == 0:
            nums.remove(n)
    return nums
`,
    hint: 'Removing items while iterating over the same list causes the loop to skip elements.',
    solution: `def remove_evens(nums):
    nums[:] = [n for n in nums if n % 2 != 0]
    return nums
`,
    tests: [
      { id: 't1', description: 'remove_evens([1, 2, 2, 3, 4, 5]) should be [1, 3, 5]', call: 'remove_evens([1, 2, 2, 3, 4, 5])', expected: [1, 3, 5] },
    ],
  },
  {
    id: 'bug-key-missing',
    type: 'bug',
    title: 'Safe Access',
    prompt: "get_config should return the value for a key, or 'default' if the key doesn't exist. Find and fix the bug.",
    timeLimit: 100,
    xp: 30,
    buggyCode: `def get_config(config, key):
    return config[key]
`,
    hint: 'Accessing a missing key with square brackets raises a KeyError.',
    solution: `def get_config(config, key):
    return config.get(key, 'default')
`,
    tests: [
      { id: 't1', description: "get_config({'theme': 'dark'}, 'font') should be 'default'", call: "get_config({'theme': 'dark'}, 'font')", expected: 'default' },
      { id: 't2', description: "get_config({'theme': 'dark'}, 'theme') should be 'dark'", call: "get_config({'theme': 'dark'}, 'theme')", expected: 'dark' },
    ],
  },
  {
    id: 'bug-string-join',
    type: 'bug',
    title: 'Sentence Builder',
    prompt: 'build_sentence should join a list of words with spaces. Find and fix the bug.',
    timeLimit: 90,
    xp: 25,
    buggyCode: `def build_sentence(words):
    return words.join(' ')
`,
    hint: 'In Python, join is a method of the separator string, not the list.',
    solution: `def build_sentence(words):
    return ' '.join(words)
`,
    tests: [
      { id: 't1', description: "build_sentence(['Hello', 'World']) should be 'Hello World'", call: "build_sentence(['Hello', 'World'])", expected: 'Hello World' },
    ],
  },
  {
    id: 'bug-negative-index',
    type: 'bug',
    title: 'Last Item',
    prompt: 'get_last should return the last item of a list. Find and fix the bug.',
    timeLimit: 60,
    xp: 15,
    buggyCode: `def get_last(lst):
    return lst[len(lst)]
`,
    hint: 'Lists are 0-indexed, so len(lst) is out of bounds.',
    solution: `def get_last(lst):
    return lst[-1]
`,
    tests: [
      { id: 't1', description: 'get_last([1, 2, 3]) should be 3', call: 'get_last([1, 2, 3])', expected: 3 },
    ],
  },
  {
    id: 'bug-is-vs-eq',
    type: 'bug',
    title: 'String Match',
    prompt: 'check_match should return True if two lists have the exact same contents. Find and fix the bug.',
    timeLimit: 120,
    xp: 35,
    buggyCode: `def check_match(a, b):
    if a is b:
        return True
    return False
`,
    hint: 'The `is` operator checks for memory identity, not value equality.',
    solution: `def check_match(a, b):
    if a == b:
        return True
    return False
`,
    tests: [
      { id: 't1', description: 'check_match([1, 2, 3], [1, 2, 3]) should be true', call: 'check_match([1, 2, 3], [1, 2, 3])', expected: true },
      { id: 't2', description: 'check_match([1], [2]) should be false', call: 'check_match([1], [2])', expected: false },
    ],
  },
  {
    id: 'bug-unhashable-type',
    type: 'bug',
    title: 'Unique Values',
    prompt: 'cache_value should store a list of numbers as a key in a dictionary. Find and fix the bug.',
    timeLimit: 150,
    xp: 45,
    buggyCode: `def cache_value(data, val):
    cache = {}
    cache[data] = val
    return cache
`,
    hint: 'Lists cannot be used as dictionary keys because they are mutable and unhashable.',
    solution: `def cache_value(data, val):
    cache = {}
    cache[tuple(data)] = val
    return cache
`,
    tests: [
      { id: 't1', description: "cache_value([1, 2], 'a') should be {(1, 2): 'a'}", call: "cache_value([1, 2], 'a')", expected: { '(1, 2)': 'a' } },
    ],
  },
  {
    id: 'bug-zip-unequal',
    type: 'bug',
    title: 'Pair Up',
    prompt: 'pair_up should combine two lists element by element into a list of tuples. If lists are unequal, it should pair until the shortest is exhausted. Find and fix the bug.',
    timeLimit: 150,
    xp: 40,
    buggyCode: `def pair_up(list1, list2):
    result = []
    for i in range(max(len(list1), len(list2))):
        result.append((list1[i], list2[i]))
    return result
`,
    hint: 'Using max() for the range will cause an IndexError when the shorter list runs out of items.',
    solution: `def pair_up(list1, list2):
    return list(zip(list1, list2))
`,
    tests: [
      { id: 't1', description: "pair_up([1, 2, 3], ['a', 'b']) should be [[1, 'a'], [2, 'b']]", call: "pair_up([1, 2, 3], ['a', 'b'])", expected: [[1, 'a'], [2, 'b']] },
    ],
  },
  {
    id: 'bug-sorting-strings-as-numbers',
    type: 'bug',
    title: 'Number Sorter',
    prompt: 'sort_numbers should sort a list of numbers represented as strings in ascending numerical order. Find and fix the bug.',
    timeLimit: 120,
    xp: 35,
    buggyCode: `def sort_numbers(str_nums):
    return sorted(str_nums)
`,
    hint: 'Sorting strings alphabetically puts "10" before "2".',
    solution: `def sort_numbers(str_nums):
    return sorted(str_nums, key=int)
`,
    tests: [
      { id: 't1', description: "sort_numbers(['10', '2', '1']) should be ['1', '2', '10']", call: "sort_numbers(['10', '2', '1'])", expected: ['1', '2', '10'] },
    ],
  },
  {
    id: 'bug-tuple-unpacking',
    type: 'bug',
    title: 'Coordinate Extractor',
    prompt: 'get_x_y should unpack a tuple of (x, y, z) and return only x and y. Find and fix the bug.',
    timeLimit: 90,
    xp: 25,
    buggyCode: `def get_x_y(coords):
    x, y = coords
    return x, y
`,
    hint: 'You cannot unpack a 3-element tuple into 2 variables.',
    solution: `def get_x_y(coords):
    x, y, z = coords
    return x, y
`,
    tests: [
      { id: 't1', description: 'get_x_y((10, 20, 30)) should be [10, 20]', call: 'get_x_y((10, 20, 30))', expected: [10, 20] },
    ],
  },
  {
    id: 'bug-string-strip',
    type: 'bug',
    title: 'Trim the Edges',
    prompt: 'clean_text should remove leading and trailing whitespace from a string. Find and fix the bug.',
    timeLimit: 60,
    xp: 15,
    buggyCode: `def clean_text(text):
    return text.trim()
`,
    hint: 'Python strings do not have a trim() method.',
    solution: `def clean_text(text):
    return text.strip()
`,
    tests: [
      { id: 't1', description: "clean_text('  hello  ') should be 'hello'", call: "clean_text('  hello  ')", expected: 'hello' },
    ],
  },
  {
    id: 'bug-sum-vs-concat',
    type: 'bug',
    title: 'Add It Up',
    prompt: 'add_values should return the numerical sum of two inputs, which might be strings. Find and fix the bug.',
    timeLimit: 90,
    xp: 30,
    buggyCode: `def add_values(a, b):
    return a + b
`,
    hint: 'If a and b are strings, the + operator concatenates them instead of adding mathematically.',
    solution: `def add_values(a, b):
    return int(a) + int(b)
`,
    tests: [
      { id: 't1', description: "add_values('5', '10') should be 15", call: "add_values('5', '10')", expected: 15 },
      { id: 't2', description: 'add_values(5, 10) should be 15', call: 'add_values(5, 10)', expected: 15 },
    ],
  },
  {
    id: 'bug-max-empty',
    type: 'bug',
    title: 'Find Max Safely',
    prompt: 'find_max should return the largest number in a list, or 0 if the list is empty. Find and fix the bug.',
    timeLimit: 100,
    xp: 30,
    buggyCode: `def find_max(nums):
    return max(nums)
`,
    hint: 'Calling max() on an empty list raises a ValueError.',
    solution: `def find_max(nums):
    return max(nums) if nums else 0
`,
    tests: [
      { id: 't1', description: 'find_max([]) should be 0', call: 'find_max([])', expected: 0 },
      { id: 't2', description: 'find_max([3, 5, 2]) should be 5', call: 'find_max([3, 5, 2])', expected: 5 },
    ],
  },
  {
    id: 'bug-dict-key-assignment',
    type: 'bug',
    title: 'Update Dictionary',
    prompt: 'add_key_value should add a new key-value pair to a dictionary and return it. Find and fix the bug.',
    timeLimit: 90,
    xp: 25,
    buggyCode: `def add_key_value(d, k, v):
    d.k = v
    return d
`,
    hint: 'Using dot notation (d.k) sets an attribute on the object, not a dictionary key.',
    solution: `def add_key_value(d, k, v):
    d[k] = v
    return d
`,
    tests: [
      { id: 't1', description: "add_key_value({}, 'name', 'Alice') should be {'name': 'Alice'}", call: "add_key_value({}, 'name', 'Alice')", expected: { name: 'Alice' } },
    ],
  },
]

export const codeWritingPool: CodeWritingChallenge[] = [
  {
    id: 'write-is-prime',
    type: 'writing',
    title: 'Prime Checker',
    prompt: 'Write a function is_prime(n) that returns True if n is a prime number, else False.',
    timeLimit: 240,
    xp: 60,
    starterCode: `def is_prime(n):
    # TODO: implement
    pass
`,
    hint: 'A number is prime if it has no divisors other than 1 and itself. Numbers less than 2 are not prime.',
    solution: `def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True
`,
    tests: [
      { id: 't1', description: 'is_prime(7) should be True', call: 'is_prime(7)', expected: true },
      { id: 't2', description: 'is_prime(1) should be False', call: 'is_prime(1)', expected: false },
      { id: 't3', description: 'is_prime(10) should be False', call: 'is_prime(10)', expected: false },
      { id: 't4', description: 'is_prime(2) should be True', call: 'is_prime(2)', expected: true },
    ],
  },
  {
    id: 'write-flatten',
    type: 'writing',
    title: 'Flatten a Nested List',
    prompt: 'Write a function flatten(nested) that flattens a list of lists into a single flat list.',
    timeLimit: 240,
    xp: 55,
    starterCode: `def flatten(nested):
    # TODO: implement
    pass
`,
    hint: 'Loop through the outer list, and extend a result list with each inner list.',
    solution: `def flatten(nested):
    result = []
    for inner in nested:
        result.extend(inner)
    return result
`,
    tests: [
      {
        id: 't1',
        description: 'flatten([[1, 2], [3], [4, 5, 6]]) should be [1, 2, 3, 4, 5, 6]',
        call: 'flatten([[1, 2], [3], [4, 5, 6]])',
        expected: [1, 2, 3, 4, 5, 6],
      },
      { id: 't2', description: 'flatten([[]]) should be []', call: 'flatten([[]])', expected: [] },
    ],
  },
  {
    id: 'write-count-vowels',
    type: 'writing',
    title: 'Vowel Counter',
    prompt: 'Write a function count_vowels(s) that returns the number of vowels (a, e, i, o, u — case-insensitive) in s.',
    timeLimit: 180,
    xp: 40,
    starterCode: `def count_vowels(s):
    # TODO: implement
    pass
`,
    hint: 'Lowercase the string first, then count characters that are in "aeiou".',
    solution: `def count_vowels(s):
    return sum(1 for ch in s.lower() if ch in 'aeiou')
`,
    tests: [
      { id: 't1', description: "count_vowels('Hello World') should be 3", call: "count_vowels('Hello World')", expected: 3 },
      { id: 't2', description: "count_vowels('xyz') should be 0", call: "count_vowels('xyz')", expected: 0 },
    ],
  },
  {
    id: 'write-reverse-string',
    type: 'writing',
    title: 'Reverse a String',
    prompt: 'Write a function reverse_string(s) that returns the reversed version of the input string.',
    timeLimit: 120,
    xp: 30,
    starterCode: `def reverse_string(s):
    # TODO: implement
    pass
`,
    hint: 'Python strings can be sliced with a step argument.',
    solution: `def reverse_string(s):
    return s[::-1]
`,
    tests: [
      { id: 't1', description: "reverse_string('hello') should be 'olleh'", call: "reverse_string('hello')", expected: 'olleh' },
      { id: 't2', description: "reverse_string('Python') should be 'nohtyP'", call: "reverse_string('Python')", expected: 'nohtyP' },
    ],
  },
  {
    id: 'write-fizzbuzz',
    type: 'writing',
    title: 'FizzBuzz',
    prompt: 'Write a function fizzbuzz(n) that returns a list of strings from 1 to n. For multiples of 3, use "Fizz". For multiples of 5, use "Buzz". For multiples of both, use "FizzBuzz".',
    timeLimit: 240,
    xp: 50,
    starterCode: `def fizzbuzz(n):
    # TODO: implement
    pass
`,
    hint: 'Check for the "FizzBuzz" condition first (multiples of both 3 and 5).',
    solution: `def fizzbuzz(n):
    result = []
    for i in range(1, n + 1):
        if i % 3 == 0 and i % 5 == 0:
            result.append("FizzBuzz")
        elif i % 3 == 0:
            result.append("Fizz")
        elif i % 5 == 0:
            result.append("Buzz")
        else:
            result.append(str(i))
    return result
`,
    tests: [
      { id: 't1', description: 'fizzbuzz(3) should be ["1", "2", "Fizz"]', call: 'fizzbuzz(3)', expected: ['1', '2', 'Fizz'] },
      { id: 't2', description: 'fizzbuzz(5) should be ["1", "2", "Fizz", "4", "Buzz"]', call: 'fizzbuzz(5)', expected: ['1', '2', 'Fizz', '4', 'Buzz'] },
      { id: 't3', description: 'fizzbuzz(15) should end with "FizzBuzz"', call: 'fizzbuzz(15)[-1]', expected: 'FizzBuzz' },
    ],
  },
  {
    id: 'write-factorial',
    type: 'writing',
    title: 'Factorial',
    prompt: 'Write a function factorial(n) that returns the factorial of n (n!). Assume n is a non-negative integer.',
    timeLimit: 180,
    xp: 45,
    starterCode: `def factorial(n):
    # TODO: implement
    pass
`,
    hint: 'The factorial of 0 is 1. Multiply all numbers from 1 to n together.',
    solution: `def factorial(n):
    if n == 0:
        return 1
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result
`,
    tests: [
      { id: 't1', description: 'factorial(5) should be 120', call: 'factorial(5)', expected: 120 },
      { id: 't2', description: 'factorial(0) should be 1', call: 'factorial(0)', expected: 1 },
      { id: 't3', description: 'factorial(3) should be 6', call: 'factorial(3)', expected: 6 },
    ],
  },
  {
    id: 'write-fibonacci',
    type: 'writing',
    title: 'Fibonacci Sequence',
    prompt: 'Write a function fibonacci(n) that returns a list of the first n numbers in the Fibonacci sequence.',
    timeLimit: 240,
    xp: 55,
    starterCode: `def fibonacci(n):
    # TODO: implement
    pass
`,
    hint: 'Start with [0, 1]. The next number is the sum of the previous two. Handle n=0 and n=1 edge cases.',
    solution: `def fibonacci(n):
    if n <= 0:
        return []
    if n == 1:
        return [0]
    seq = [0, 1]
    while len(seq) < n:
        seq.append(seq[-1] + seq[-2])
    return seq
`,
    tests: [
      { id: 't1', description: 'fibonacci(5) should be [0, 1, 1, 2, 3]', call: 'fibonacci(5)', expected: [0, 1, 1, 2, 3] },
      { id: 't2', description: 'fibonacci(1) should be [0]', call: 'fibonacci(1)', expected: [0] },
      { id: 't3', description: 'fibonacci(0) should be []', call: 'fibonacci(0)', expected: [] },
    ],
  },
  {
    id: 'write-is-palindrome-words',
    type: 'writing',
    title: 'Palindrome Checker',
    prompt: 'Write a function is_palindrome(s) that returns True if the string s is a palindrome. Ignore case and spaces.',
    timeLimit: 180,
    xp: 40,
    starterCode: `def is_palindrome(s):
    # TODO: implement
    pass
`,
    hint: 'Lowercase the string and remove spaces before checking if it equals its reverse.',
    solution: `def is_palindrome(s):
    clean_s = s.lower().replace(" ", "")
    return clean_s == clean_s[::-1]
`,
    tests: [
      { id: 't1', description: "is_palindrome('Racecar') should be True", call: "is_palindrome('Racecar')", expected: true },
      { id: 't2', description: "is_palindrome('hello') should be False", call: "is_palindrome('hello')", expected: false },
      { id: 't3', description: "is_palindrome('A Santa at NASA') should be True", call: "is_palindrome('A Santa at NASA')", expected: true },
    ],
  },
  {
    id: 'write-word-frequency',
    type: 'writing',
    title: 'Word Frequency',
    prompt: 'Write a function word_frequency(sentence) that returns a dictionary mapping each word to its count. Words are separated by spaces.',
    timeLimit: 240,
    xp: 50,
    starterCode: `def word_frequency(sentence):
    # TODO: implement
    pass
`,
    hint: 'Split the sentence into words, then use a dictionary to tally them up.',
    solution: `def word_frequency(sentence):
    words = sentence.split()
    freq = {}
    for word in words:
        freq[word] = freq.get(word, 0) + 1
    return freq
`,
    tests: [
      { id: 't1', description: "word_frequency('apple banana apple') should be {'apple': 2, 'banana': 1}", call: "word_frequency('apple banana apple')", expected: { apple: 2, banana: 1 } },
      { id: 't2', description: "word_frequency('hello') should be {'hello': 1}", call: "word_frequency('hello')", expected: { hello: 1 } },
    ],
  },
  {
    id: 'write-second-largest',
    type: 'writing',
    title: 'Second Largest',
    prompt: 'Write a function second_largest(nums) that returns the second largest number in a list. Assume the list has at least two unique numbers.',
    timeLimit: 200,
    xp: 50,
    starterCode: `def second_largest(nums):
    # TODO: implement
    pass
`,
    hint: 'You can sort the unique elements, or keep track of the top two while iterating.',
    solution: `def second_largest(nums):
    unique_nums = list(set(nums))
    unique_nums.sort()
    return unique_nums[-2]
`,
    tests: [
      { id: 't1', description: 'second_largest([10, 20, 4, 45, 99]) should be 45', call: 'second_largest([10, 20, 4, 45, 99])', expected: 45 },
      { id: 't2', description: 'second_largest([5, 5, 2]) should be 2', call: 'second_largest([5, 5, 2])', expected: 2 },
    ],
  },
  {
    id: 'write-is-anagram',
    type: 'writing',
    title: 'Anagram Checker',
    prompt: 'Write a function is_anagram(s1, s2) that returns True if s1 and s2 are anagrams of each other.',
    timeLimit: 180,
    xp: 40,
    starterCode: `def is_anagram(s1, s2):
    # TODO: implement
    pass
`,
    hint: 'If you sort the characters of both strings, they should be identical.',
    solution: `def is_anagram(s1, s2):
    return sorted(s1) == sorted(s2)
`,
    tests: [
      { id: 't1', description: "is_anagram('listen', 'silent') should be True", call: "is_anagram('listen', 'silent')", expected: true },
      { id: 't2', description: "is_anagram('hello', 'world') should be False", call: "is_anagram('hello', 'world')", expected: false },
    ],
  },
  {
    id: 'write-list-intersection',
    type: 'writing',
    title: 'List Intersection',
    prompt: 'Write a function list_intersection(list1, list2) that returns a list of unique elements present in both lists.',
    timeLimit: 180,
    xp: 45,
    starterCode: `def list_intersection(list1, list2):
    # TODO: implement
    pass
`,
    hint: 'Convert both lists to sets and use the intersection operator (&).',
    solution: `def list_intersection(list1, list2):
    return list(set(list1) & set(list2))
`,
    tests: [
      { id: 't1', description: 'list_intersection([1, 2, 3], [2, 3, 4]) should be [2, 3]', call: 'list_intersection([1, 2, 3], [2, 3, 4])', expected: [2, 3] },
      { id: 't2', description: 'list_intersection([1, 1, 2], [2, 2, 3]) should be [2]', call: 'list_intersection([1, 1, 2], [2, 2, 3])', expected: [2] },
    ],
  },
  {
    id: 'write-remove-duplicates',
    type: 'writing',
    title: 'Remove Duplicates',
    prompt: 'Write a function remove_duplicates(lst) that removes duplicates from a list while preserving the original order.',
    timeLimit: 220,
    xp: 50,
    starterCode: `def remove_duplicates(lst):
    # TODO: implement
    pass
`,
    hint: 'Use a set to track seen elements and a list to store results in order.',
    solution: `def remove_duplicates(lst):
    seen = set()
    result = []
    for item in lst:
        if item not in seen:
            result.append(item)
            seen.add(item)
    return result
`,
    tests: [
      { id: 't1', description: 'remove_duplicates([1, 2, 2, 3, 1]) should be [1, 2, 3]', call: 'remove_duplicates([1, 2, 2, 3, 1])', expected: [1, 2, 3] },
      { id: 't2', description: 'remove_duplicates(["a", "b", "a"]) should be ["a", "b"]', call: 'remove_duplicates(["a", "b", "a"])', expected: ['a', 'b'] },
    ],
  },
  {
    id: 'write-capitalize-words',
    type: 'writing',
    title: 'Capitalize Words',
    prompt: 'Write a function capitalize_words(s) that capitalizes the first letter of each word in the string s.',
    timeLimit: 150,
    xp: 35,
    starterCode: `def capitalize_words(s):
    # TODO: implement
    pass
`,
    hint: 'Split the string, capitalize each word, and join them back with spaces.',
    solution: `def capitalize_words(s):
    return ' '.join(word.capitalize() for word in s.split())
`,
    tests: [
      { id: 't1', description: "capitalize_words('hello world') should be 'Hello World'", call: "capitalize_words('hello world')", expected: 'Hello World' },
      { id: 't2', description: "capitalize_words('python is fun') should be 'Python Is Fun'", call: "capitalize_words('python is fun')", expected: 'Python Is Fun' },
    ],
  },
  {
    id: 'write-sum-digits',
    type: 'writing',
    title: 'Sum of Digits',
    prompt: 'Write a function sum_digits(n) that returns the sum of the digits of a non-negative integer n.',
    timeLimit: 150,
    xp: 35,
    starterCode: `def sum_digits(n):
    # TODO: implement
    pass
`,
    hint: 'Convert the number to a string to iterate over its digits.',
    solution: `def sum_digits(n):
    return sum(int(d) for d in str(n))
`,
    tests: [
      { id: 't1', description: 'sum_digits(123) should be 6', call: 'sum_digits(123)', expected: 6 },
      { id: 't2', description: 'sum_digits(0) should be 0', call: 'sum_digits(0)', expected: 0 },
    ],
  },
  {
    id: 'write-gcd',
    type: 'writing',
    title: 'Greatest Common Divisor',
    prompt: 'Write a function gcd(a, b) that returns the Greatest Common Divisor of a and b using the Euclidean algorithm.',
    timeLimit: 220,
    xp: 55,
    starterCode: `def gcd(a, b):
    # TODO: implement
    pass
`,
    hint: 'While b is not zero, set a to b and b to a % b. Return a when b is 0.',
    solution: `def gcd(a, b):
    while b:
        a, b = b, a % b
    return a
`,
    tests: [
      { id: 't1', description: 'gcd(48, 18) should be 6', call: 'gcd(48, 18)', expected: 6 },
      { id: 't2', description: 'gcd(100, 10) should be 10', call: 'gcd(100, 10)', expected: 10 },
    ],
  },
  {
    id: 'write-binary-to-decimal',
    type: 'writing',
    title: 'Binary to Decimal',
    prompt: 'Write a function binary_to_decimal(binary_str) that converts a string of 1s and 0s into a decimal integer.',
    timeLimit: 150,
    xp: 30,
    starterCode: `def binary_to_decimal(binary_str):
    # TODO: implement
    pass
`,
    hint: 'Python has a built-in function to convert a string to an integer with a specific base.',
    solution: `def binary_to_decimal(binary_str):
    return int(binary_str, 2)
`,
    tests: [
      { id: 't1', description: "binary_to_decimal('1010') should be 10", call: "binary_to_decimal('1010')", expected: 10 },
      { id: 't2', description: "binary_to_decimal('1111') should be 15", call: "binary_to_decimal('1111')", expected: 15 },
    ],
  },
  {
    id: 'write-merge-sorted',
    type: 'writing',
    title: 'Merge Sorted Lists',
    prompt: 'Write a function merge_sorted(list1, list2) that merges two sorted lists into a single sorted list.',
    timeLimit: 200,
    xp: 45,
    starterCode: `def merge_sorted(list1, list2):
    # TODO: implement
    pass
`,
    hint: 'You can concatenate and sort, or use a two-pointer approach for O(n) time.',
    solution: `def merge_sorted(list1, list2):
    return sorted(list1 + list2)
`,
    tests: [
      { id: 't1', description: 'merge_sorted([1, 3, 5], [2, 4, 6]) should be [1, 2, 3, 4, 5, 6]', call: 'merge_sorted([1, 3, 5], [2, 4, 6])', expected: [1, 2, 3, 4, 5, 6] },
      { id: 't2', description: 'merge_sorted([], [1, 2]) should be [1, 2]', call: 'merge_sorted([], [1, 2])', expected: [1, 2] },
    ],
  },
  {
    id: 'write-count-occurrences',
    type: 'writing',
    title: 'Count Occurrences',
    prompt: 'Write a function count_occurrences(lst, target) that returns how many times target appears in lst.',
    timeLimit: 120,
    xp: 25,
    starterCode: `def count_occurrences(lst, target):
    # TODO: implement
    pass
`,
    hint: 'Lists have a built-in method for counting elements.',
    solution: `def count_occurrences(lst, target):
    return lst.count(target)
`,
    tests: [
      { id: 't1', description: 'count_occurrences([1, 2, 2, 3, 2], 2) should be 3', call: 'count_occurrences([1, 2, 2, 3, 2], 2)', expected: 3 },
      { id: 't2', description: "count_occurrences(['a', 'b', 'a'], 'a') should be 2", call: "count_occurrences(['a', 'b', 'a'], 'a')", expected: 2 },
    ],
  },
  {
    id: 'write-is-sorted',
    type: 'writing',
    title: 'Check If Sorted',
    prompt: 'Write a function is_sorted(lst) that returns True if the list is sorted in non-decreasing order.',
    timeLimit: 150,
    xp: 30,
    starterCode: `def is_sorted(lst):
    # TODO: implement
    pass
`,
    hint: 'Compare the list to a sorted version of itself.',
    solution: `def is_sorted(lst):
    return lst == sorted(lst)
`,
    tests: [
      { id: 't1', description: 'is_sorted([1, 2, 3]) should be True', call: 'is_sorted([1, 2, 3])', expected: true },
      { id: 't2', description: 'is_sorted([3, 1, 2]) should be False', call: 'is_sorted([3, 1, 2])', expected: false },
    ],
  },
  {
    id: 'write-reverse-words',
    type: 'writing',
    title: 'Reverse Words in String',
    prompt: 'Write a function reverse_words(s) that reverses the order of words in a string.',
    timeLimit: 150,
    xp: 35,
    starterCode: `def reverse_words(s):
    # TODO: implement
    pass
`,
    hint: 'Split the string into words, reverse the list, and join them back.',
    solution: `def reverse_words(s):
    words = s.split()
    return ' '.join(words[::-1])
`,
    tests: [
      { id: 't1', description: "reverse_words('hello world') should be 'world hello'", call: "reverse_words('hello world')", expected: 'world hello' },
      { id: 't2', description: "reverse_words('Python is fun') should be 'fun is Python'", call: "reverse_words('Python is fun')", expected: 'fun is Python' },
    ],
  },
  {
    id: 'write-transpose-matrix',
    type: 'writing',
    title: 'Transpose Matrix',
    prompt: 'Write a function transpose_matrix(matrix) that transposes a 2D list (matrix).',
    timeLimit: 220,
    xp: 55,
    starterCode: `def transpose_matrix(matrix):
    # TODO: implement
    pass
`,
    hint: 'The built-in zip() function can be used with unpacking (*) to transpose rows and columns.',
    solution: `def transpose_matrix(matrix):
    return [list(row) for row in zip(*matrix)]
`,
    tests: [
      { id: 't1', description: 'transpose_matrix([[1, 2], [3, 4]]) should be [[1, 3], [2, 4]]', call: 'transpose_matrix([[1, 2], [3, 4]])', expected: [[1, 3], [2, 4]] },
      { id: 't2', description: 'transpose_matrix([[1, 2, 3]]) should be [[1], [2], [3]]', call: 'transpose_matrix([[1, 2, 3]])', expected: [[1], [2], [3]] },
    ],
  },
  {
    id: 'write-valid-parentheses',
    type: 'writing',
    title: 'Valid Parentheses',
    prompt: "Write a function is_valid_parentheses(s) that returns True if the string contains valid matching parentheses (), brackets [], and braces {}.",
    timeLimit: 300,
    xp: 70,
    starterCode: `def is_valid_parentheses(s):
    # TODO: implement
    pass
`,
    hint: 'Use a stack. Push opening brackets, pop and check for matching closing brackets.',
    solution: `def is_valid_parentheses(s):
    stack = []
    mapping = {')': '(', ']': '[', '}': '{'}
    for char in s:
        if char in mapping.values():
            stack.append(char)
        elif char in mapping:
            if not stack or stack[-1] != mapping[char]:
                return False
            stack.pop()
    return not stack
`,
    tests: [
      { id: 't1', description: "is_valid_parentheses('()') should be True", call: "is_valid_parentheses('()')", expected: true },
      { id: 't2', description: "is_valid_parentheses('()[]{}') should be True", call: "is_valid_parentheses('()[]{}')", expected: true },
      { id: 't3', description: "is_valid_parentheses('(]') should be False", call: "is_valid_parentheses('(]')", expected: false },
      { id: 't4', description: "is_valid_parentheses('([)]') should be False", call: "is_valid_parentheses('([)]')", expected: false },
    ],
  },
]

export const objectivePool: ObjectiveChallenge[] = [
  {
    id: 'obj-string-mult',
    type: 'objective',
    title: 'Quick Check',
    prompt: "What is the output of print(3 * '7') in Python?",
    timeLimit: 40,
    xp: 15,
    options: ['21', '777', 'TypeError', "'3777'"],
    correctIndex: 1,
    explanation: "Multiplying a string by an int repeats the string, so '7' * 3 becomes '777'.",
  },
  {
    id: 'obj-mutability',
    type: 'objective',
    title: 'Quick Check',
    prompt: 'Which of these Python types is mutable?',
    timeLimit: 40,
    xp: 15,
    options: ['tuple', 'str', 'list', 'frozenset'],
    correctIndex: 2,
    explanation: 'Lists can be changed in place; tuples, strings, and frozensets cannot.',
  },
  {
    id: 'obj-is-operator',
    type: 'objective',
    title: 'Quick Check',
    prompt: 'What does the `is` operator compare in Python?',
    timeLimit: 40,
    xp: 15,
    options: ['Value equality', 'Object identity (same memory location)', 'Data type only', 'Hash equality'],
    correctIndex: 1,
    explanation: '`is` checks whether two references point to the exact same object, not whether their values are equal.',
  },
  {
    id: 'obj-truthy-list',
    type: 'objective',
    title: 'Quick Check',
    prompt: 'What does bool([]) evaluate to?',
    timeLimit: 30,
    xp: 10,
    options: ['True', 'False', 'Error', 'None'],
    correctIndex: 1,
    explanation: 'An empty list is falsy in Python.',
  },
  {
    id: 'obj-exponent-associativity',
    type: 'objective',
    title: 'Quick Check',
    prompt: 'What is the output of print(2 ** 3 ** 2)?',
    timeLimit: 45,
    xp: 20,
    options: ['64', '512', '81', '12'],
    correctIndex: 1,
    explanation: 'The ** operator is right-associative, so 3 ** 2 = 9 is evaluated first, then 2 ** 9 = 512.',
  },
  {
    id: 'obj-append-return',
    type: 'objective',
    title: 'Quick Check',
    prompt: 'What does the expression [1, 2].append(3) return?',
    timeLimit: 35,
    xp: 15,
    options: ['[1, 2, 3]', 'None', 'True', '3'],
    correctIndex: 1,
    explanation: 'list.append() modifies the list in place and returns None, not the modified list.',
  },
  {
    id: 'obj-floor-div',
    type: 'objective',
    title: 'Quick Check',
    prompt: 'What is the output of print(10 // 3)?',
    timeLimit: 30,
    xp: 10,
    options: ['3.33', '3', '4', '3.0'],
    correctIndex: 1,
    explanation: 'The // operator performs floor division, returning the largest integer less than or equal to the result: 10 // 3 = 3.',
  },
  {
    id: 'obj-floor-div-negative',
    type: 'objective',
    title: 'Quick Check',
    prompt: 'What is the output of print(-5 // 2)?',
    timeLimit: 45,
    xp: 20,
    options: ['-2', '-3', '-2.5', '-1'],
    correctIndex: 1,
    explanation: 'Floor division rounds toward negative infinity, so -5 // 2 = -3 (not -2).',
  },
  {
    id: 'obj-set-length',
    type: 'objective',
    title: 'Quick Check',
    prompt: 'What is the output of print(len(set([1, 1, 2, 2, 3, 3])))?',
    timeLimit: 40,
    xp: 15,
    options: ['6', '3', '1', 'TypeError'],
    correctIndex: 1,
    explanation: 'A set removes duplicate values, so {1, 2, 3} has a length of 3.',
  },
  {
    id: 'obj-tuple-unpacking',
    type: 'objective',
    title: 'Quick Check',
    prompt: 'After running: a, *b = [1, 2, 3, 4], what is the value of b?',
    timeLimit: 45,
    xp: 20,
    options: ['[2, 3, 4]', '[1, 2, 3, 4]', '(2, 3, 4)', '2'],
    correctIndex: 0,
    explanation: 'The * operator collects remaining items into a list, so a = 1 and b = [2, 3, 4].',
  },
  {
    id: 'obj-list-slicing',
    type: 'objective',
    title: 'Quick Check',
    prompt: 'What is the output of print([1, 2, 3, 4][1:3])?',
    timeLimit: 35,
    xp: 15,
    options: ['[1, 2]', '[2, 3]', '[2, 3, 4]', '[1, 2, 3]'],
    correctIndex: 1,
    explanation: 'Slicing [1:3] includes index 1 up to (but not including) index 3, giving [2, 3].',
  },
  {
    id: 'obj-isinstance-bool',
    type: 'objective',
    title: 'Quick Check',
    prompt: 'What does print(isinstance(True, int)) output?',
    timeLimit: 40,
    xp: 20,
    options: ['True', 'False', 'TypeError', 'None'],
    correctIndex: 0,
    explanation: 'In Python, bool is a subclass of int, so True is an instance of int. True == 1 and False == 0.',
  },
  {
    id: 'obj-division-type',
    type: 'objective',
    title: 'Quick Check',
    prompt: "What is the type of the result of 1 / 2 in Python 3?",
    timeLimit: 35,
    xp: 15,
    options: ['int', 'float', 'Fraction', 'decimal.Decimal'],
    correctIndex: 1,
    explanation: 'The / operator always returns a float in Python 3, even when both operands are integers: 1 / 2 = 0.5.',
  },
  {
    id: 'obj-dict-in-operator',
    type: 'objective',
    title: 'Quick Check',
    prompt: "What does print('a' in {'a': 1, 'b': 2}) output?",
    timeLimit: 35,
    xp: 15,
    options: ['True', 'False', '1', 'KeyError'],
    correctIndex: 0,
    explanation: 'The `in` operator checks dictionary keys by default, not values. Since "a" is a key, it returns True.',
  },
  {
    id: 'obj-float-precision',
    type: 'objective',
    title: 'Quick Check',
    prompt: 'What does print(0.1 + 0.2 == 0.3) output?',
    timeLimit: 45,
    xp: 25,
    options: ['True', 'False', 'TypeError', '1'],
    correctIndex: 1,
    explanation: 'Due to floating-point representation, 0.1 + 0.2 = 0.30000000000000004, which is not exactly equal to 0.3.',
  },
  {
    id: 'obj-list-concat',
    type: 'objective',
    title: 'Quick Check',
    prompt: 'What is the output of print([1, 2, 3] + [4, 5])?',
    timeLimit: 30,
    xp: 10,
    options: ['[1, 2, 3, 4, 5]', '[[1, 2, 3], [4, 5]]', '[5, 7]', 'TypeError'],
    correctIndex: 0,
    explanation: 'The + operator concatenates two lists into a single new list: [1, 2, 3, 4, 5].',
  },
  {
    id: 'obj-zip-function',
    type: 'objective',
    title: 'Quick Check',
    prompt: "What is the output of print(list(zip([1, 2], ['a', 'b'])))?",
    timeLimit: 45,
    xp: 20,
    options: ["[(1, 'a'), (2, 'b')]", "[(1, 2), ('a', 'b')]", "['1a', '2b']", "[1, 'a', 2, 'b']"],
    correctIndex: 0,
    explanation: 'zip pairs elements from each iterable at the same index, producing tuples: (1, "a") and (2, "b").',
  },
  {
    id: 'obj-enumerate',
    type: 'objective',
    title: 'Quick Check',
    prompt: "What is the output of print(list(enumerate(['a', 'b'])))?",
    timeLimit: 40,
    xp: 15,
    options: ["[(0, 'a'), (1, 'b')]", "['a', 'b']", "[( 'a', 0), ('b', 1)]", "[0, 1]"],
    correctIndex: 0,
    explanation: 'enumerate yields (index, value) tuples starting from index 0 by default: [(0, "a"), (1, "b")].',
  },
  {
    id: 'obj-capitalize',
    type: 'objective',
    title: 'Quick Check',
    prompt: 'What is the output of print("hello world".capitalize())?',
    timeLimit: 35,
    xp: 15,
    options: ['"Hello World"', '"Hello world"', '"HELLO WORLD"', '"hello World"'],
    correctIndex: 1,
    explanation: 'capitalize() only capitalizes the first character of the entire string and lowercases the rest: "Hello world".',
  },
  {
    id: 'obj-sum-with-start',
    type: 'objective',
    title: 'Quick Check',
    prompt: 'What is the output of print(sum([1, 2, 3], 10))?',
    timeLimit: 40,
    xp: 20,
    options: ['6', '16', '10', 'TypeError'],
    correctIndex: 1,
    explanation: 'The second argument to sum() is the starting value, so 10 + 1 + 2 + 3 = 16.',
  },
  {
    id: 'obj-sorted-vs-sort',
    type: 'objective',
    title: 'Quick Check',
    prompt: 'What is the key difference between sorted() and list.sort()?',
    timeLimit: 40,
    xp: 20,
    options: [
      'sorted() sorts in place, .sort() returns a new list',
      'sorted() returns a new list, .sort() sorts in place',
      'Both sort in place',
      'Both return new lists',
    ],
    correctIndex: 1,
    explanation: 'sorted() returns a new sorted list without modifying the original, while .sort() modifies the list in place and returns None.',
  },
  {
    id: 'obj-range-with-step',
    type: 'objective',
    title: 'Quick Check',
    prompt: 'What is the output of print(list(range(0, 10, 2)))?',
    timeLimit: 35,
    xp: 15,
    options: ['[0, 2, 4, 6, 8]', '[0, 2, 4, 6, 8, 10]', '[2, 4, 6, 8, 10]', '[0, 1, 2, 3, 4]'],
    correctIndex: 0,
    explanation: 'range(0, 10, 2) starts at 0, steps by 2, and stops before 10: [0, 2, 4, 6, 8].',
  },
  {
    id: 'obj-bool-zero',
    type: 'objective',
    title: 'Quick Check',
    prompt: 'What does bool(0) evaluate to?',
    timeLimit: 30,
    xp: 10,
    options: ['True', 'False', 'TypeError', '0'],
    correctIndex: 1,
    explanation: 'The integer 0 is falsy in Python, so bool(0) returns False. All other non-zero integers are truthy.',
  },
  {
    id: 'obj-f-string',
    type: 'objective',
    title: 'Quick Check',
    prompt: 'What is the output of print(f"{2 + 3}")?',
    timeLimit: 35,
    xp: 15,
    options: ['"2 + 3"', "'5'", '5', 'TypeError'],
    correctIndex: 2,
    explanation: 'f-strings evaluate the expression inside {} and insert the result. 2 + 3 = 5, and print displays 5 without quotes.',
  },
  {
    id: 'obj-none-equality',
    type: 'objective',
    title: 'Quick Check',
    prompt: 'What does print(None == None) output?',
    timeLimit: 30,
    xp: 10,
    options: ['True', 'False', 'TypeError', 'None'],
    correctIndex: 0,
    explanation: 'None is a singleton in Python. There is only one None object, so None == None and None is None both return True.',
  },
  {
    id: 'obj-string-join',
    type: 'objective',
    title: 'Quick Check',
    prompt: 'What is the output of print("-".join(["a", "b", "c"]))?',
    timeLimit: 35,
    xp: 15,
    options: ['"a-b-c"', '"abc"', '"a, b, c"', '"-abc"'],
    correctIndex: 0,
    explanation: 'str.join() concatenates iterable elements using the string as a separator: "a" + "-" + "b" + "-" + "c" = "a-b-c".',
  },
  {
    id: 'obj-dict-get-default',
    type: "objective",
    title: 'Quick Check',
    prompt: "What is the output of print({'a': 1}.get('b', 0))?",
    timeLimit: 40,
    xp: 20,
    options: ['0', '1', 'None', 'KeyError'],
    correctIndex: 0,
    explanation: 'dict.get(key, default) returns the default value (0) if the key ("b") is not found, instead of raising a KeyError.',
  },
  {
    id: 'obj-short-circuit',
    type: 'objective',
    title: 'Quick Check',
    prompt: 'What is the output of print(0 and "hello")?',
    timeLimit: 40,
    xp: 20,
    options: ['0', '"hello"', 'True', 'False'],
    correctIndex: 0,
    explanation: 'The `and` operator returns the first falsy value it encounters. Since 0 is falsy, it short-circuits and returns 0 immediately.',
  },
]

// ────────────────────────────────────────────────────────────────
// PACK GENERATION
// ────────────────────────────────────────────────────────────────

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** One random question of each type, order shuffled. Always length 3. */
export function generateInterviewPack(): Challenge[] {
  return shuffle([pickRandom(bugFixPool), pickRandom(codeWritingPool), pickRandom(objectivePool)]);
}

export const INTERVIEW_META = {
  title: 'Mock Python Interview',
  subtitle:
    "Three random challenges. One combined timer. Spot them, fix them, ship them — the way an interviewer would ask you to.",
  rules: [
    'One Bug-Fix, one Code-Writing, and one Objective question — order shuffled every time',
    "One combined timer — the sum of each challenge's individual time budget",
    '"Next" appears as soon as all tests pass — or you can skip',
    'Time runs out → you go to the results screen immediately',
    "Hints and solutions are hidden during the interview — you're on your own",
  ],
};