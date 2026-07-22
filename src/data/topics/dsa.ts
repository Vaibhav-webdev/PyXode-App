import { TopicContent } from "./types";

export const DSA_TOPICS: TopicContent[] = 
[
  {
    id: "dsa_01",
    tab: "basic",
    number: "01",
    title: "Time\nComplexity",
    iconKey: "infinity",
    xpReward: 80,
    theorySlides: [
      {
        heading: "What is Time Complexity?",
        body: "Time complexity kisi code ke run hone ke time ko measure nahi karta, balki ye batata hai ki input size (n) badhne par algorithm ki speed kaise affect hoti hai. Ye input ke growth rate ko measure karta hai.",
        codeExample: "# Time complexity O(n) ka example\ndef print_items(n):\n  for i in range(n):\n    print(i)"
      },
      {
        heading: "Big O Notation",
        body: "Big O Notation algorithm ke worst-case scenario ko describe karta hai. Common complexities: O(1) - Constant, O(log n) - Logarithmic, O(n) - Linear, O(n log n) - Linearithmic, O(n^2) - Quadratic.",
        codeExample: "# O(n^2) - Quadratic Time\ndef print_pairs(n):\n  for i in range(n):\n    for j in range(n):\n      print(i, j)"
      },
      {
        heading: "O(1) vs O(n)",
        body: "O(1) ka matlab hai ki input chahe kitna bhi bada ho, operation hamesha same time lagega (e.g., list me index se access). O(n) ka matlab hai operation ka time input ke size ke proportion me badhega (e.g., list me linear search).",
        codeExample: "# O(1) - Constant Time\nitems = [10, 20, 30]\nprint(items[1]) # Always fast\n\n# O(n) - Linear Time\nfor item in items:\n  print(item)"
      },
      {
        heading: "Space Complexity",
        body: "Time ke sath hi Space Complexity bhi important hai. Ye batata hai ki algorithm run hone ke liye kitni extra memory ya space use kar raha hai. Agar ek n-size ki list bani hai, toh space complexity O(n) hogi.",
        codeExample: "# Space Complexity O(1)\ndef multiply_by_two(n):\n  return n * 2 # No extra space used\n\n# Space Complexity O(n)\ndef create_list(n):\n  return [i for i in range(n)] # O(n) space"
      }
    ],
    quiz: [
      {
        id: "dsa_01_q1",
        type: "mcq",
        question: "Ek loop jo 'n' times chalta hai, uski Time Complexity kya hogi?",
        options: ["O(1)", "O(n)", "O(n^2)", "O(log n)"],
        correctAnswer: "O(n)",
        explanation: "Kyunki loop input size 'n' par depend karta hai, agar n badhega toh time bhi badhega, isliye ye Linear time complexity O(n) hai."
      },
      {
        id: "dsa_01_q2",
        type: "predict_output",
        question: "Is code ki Time Complexity kya hai?",
        codeSnippet: "def test(n):\n    i = 1\n    while i < n:\n        i = i * 2\n        print(i)",
        options: ["O(n)", "O(n^2)", "O(log n)", "O(1)"],
        correctAnswer: "O(log n)",
        explanation: "Loop me 'i' double ho raha hai har baar (i = i * 2), isliye loop bahut kam times chalega. Ye Logarithmic time complexity hai."
      },
      {
        id: "dsa_01_q3",
        type: "mcq",
        question: "List ke kisi specific index (e.g., list[5]) ko access karne ki time complexity kya hoti hai?",
        options: ["O(n)", "O(log n)", "O(1)", "O(n^2)"],
        correctAnswer: "O(1)",
        explanation: "Array/List me index se element access karna constant time O(1) me hota hai kyunki memory address direct calculate ho jata hai."
      },
      {
        id: "dsa_01_code1",
        type: "code_writing",
        question: "Ek function likho jo 1 se n tak sabhi numbers ka sum return kare. (Time Complexity O(1) wala formula use karo, loop mat lagao).",
        options: [],
        correctAnswer: "def sum_n(n):\n    return n * (n + 1) // 2",
        acceptedAnswers: ["def sum_n(n):\n    return n * (n + 1) // 2", "def sum_n(n):\n    return n*(n+1)//2"],
        expectedOutput: "5050",
        explanation: "Math ka formula n*(n+1)/2 use karne par loop ki zarurat nahi parti, isliye time complexity O(1) rehti hai instead of O(n)."
      }
    ]
  },
  {
    id: "dsa_02",
    tab: "basic",
    number: "02",
    title: "Arrays",
    iconKey: "grid-3x3",
    xpReward: 70,
    theorySlides: [
      {
        heading: "What are Arrays?",
        body: "Array ek contiguous (lagatar) memory location me store hone wala same data type ka collection hai. Python me hum Arrays ke liye 'List' ka use karte hain jo ki dynamically sized hoti hai.",
        codeExample: "# Python List (Dynamic Array)\nnumbers = [10, 20, 30, 40]\nprint(numbers[0]) # Output: 10"
      },
      {
        heading: "Array Operations",
        body: "Arrays me access O(1) hota hai. Lekin agar beech me koi element insert ya delete karna ho toh baaki ke elements ko shift karna padta hai, jo O(n) time leta hai.",
        codeExample: "nums = [1, 2, 3, 5]\n# Insert karne par shift hoga\nnums.insert(3, 4) # [1, 2, 3, 4, 5]\n# Delete karne par bhi shift hoga\nnums.pop(0) # [2, 3, 4, 5]"
      },
      {
        heading: "2D Arrays (Matrices)",
        body: "Jab ek array ke andar aur arrays aate hain, toh use 2D array ya Matrix kehte hain. Ye rows aur columns jaisa dikhta hai. Isme element access karne ke liye 2 indices lagte hain (row, col).",
        codeExample: "matrix = [\n  [1, 2, 3],\n  [4, 5, 6],\n  [7, 8, 9]\n]\nprint(matrix[1][2]) # Output: 6"
      }
    ],
    quiz: [
      {
        id: "dsa_02_q1",
        type: "mcq",
        question: "Python list (array) ke end me element add karne (append) ki average time complexity kya hoti hai?",
        options: ["O(n)", "O(1)", "O(log n)", "O(n^2)"],
        correctAnswer: "O(1)",
        explanation: "List ke end me element add karna O(1) time leta hai kyunki koi dusre element ko shift nahi karna padta."
      },
      {
        id: "dsa_02_q2",
        type: "predict_output",
        question: "Is code ka output kya hoga?",
        codeSnippet: "arr = [1, 2, 3, 4, 5]\narr.pop(2)\nprint(arr)",
        options: ["[1, 2, 4, 5]", "[1, 2, 3, 5]", "[1, 3, 4, 5]", "Error"],
        correctAnswer: "[1, 2, 4, 5]",
        explanation: "pop(2) index 2 par jo element hai (3) use delete kar dega, aur bacha hua list left shift ho jayegi."
      },
      {
        id: "dsa_02_code1",
        type: "code_writing",
        question: "Ek function likho jo ek list aur ek target value le, aur agar target list me hai toh uska index return kare, warna -1 return kare. (Linear Search)",
        options: [],
        correctAnswer: "def linear_search(arr, target):\n    for i in range(len(arr)):\n        if arr[i] == target:\n            return i\n    return -1",
        acceptedAnswers: ["def linear_search(arr, target):\n    for i in range(len(arr)):\n        if arr[i] == target:\n            return i\n    return -1"],
        expectedOutput: "2",
        explanation: "Ye linear search hai jo ek ek karke list check karta hai. Iski time complexity O(n) hai."
      }
    ]
  },
  {
    id: "dsa_03",
    tab: "basic",
    number: "03",
    title: "Linked Lists",
    iconKey: "layers",
    xpReward: 85,
    theorySlides: [
      {
        heading: "What is a Linked List?",
        body: "Linked List ek linear data structure hai jo elements ko contiguous memory me nahi, balki nodes me store karta hai. Har node me 2 cheezein hoti hain: Data aur Next node ka address (pointer).",
        codeExample: "class Node:\n  def __init__(self, data):\n    self.data = data\n    self.next = None"
      },
      {
        heading: "Arrays vs Linked Lists",
        body: "Arrays me memory ek sath hoti hai (access fast O(1)), par insertion/deletion slow (O(n)) hota hai. Linked lists me memory random hoti hai (access slow O(n)), par insertion/deletion fast (O(1)) hota hai kyunki koi shift nahi karna padta, sirf pointers change karne padte hain.",
        codeExample: "# Insertion in Linked List (Concept)\n# new_node.next = prev_node.next\n# prev_node.next = new_node"
      },
      {
        heading: "Types of Linked Lists",
        body: "1. Singly Linked List: Har node sirf next node ko point karta hai.\n2. Doubly Linked List: Har node next aur previous dono nodes ko point karta hai.\n3. Circular Linked List: Last node first node ko point karta hai.",
        codeExample: "# Doubly Linked List Node\nclass DoublyNode:\n  def __init__(self, data):\n    self.data = data\n    self.next = None\n    self.prev = None"
      },
      {
        heading: "Traversing a Linked List",
        body: "Linked list me data access karne ke liye hum head (starting node) se start karte hain aur jab tak next pointer None nahi hota, tab tak aage badhte hain.",
        codeExample: "def traverse(head):\n  current = head\n  while current is not None:\n    print(current.data)\n    current = current.next"
      }
    ],
    quiz: [
      {
        id: "dsa_03_q1",
        type: "mcq",
        question: "Linked List me kisi bhi element ko access (index se) karne ki time complexity kya hai?",
        options: ["O(1)", "O(n)", "O(log n)", "O(1) for first element only"],
        correctAnswer: "O(n)",
        explanation: "Linked list me continuous memory nahi hoti, isliye index se direct access nahi ho sakta. Humeko head se ek ek karke traverse karna padta hai."
      },
      {
        id: "dsa_03_q2",
        type: "predict_output",
        question: "Agar ek Linked List 1 -> 2 -> 3 -> None hai, aur hum head.next = head.next.next kar dein, toh list kya hogi?",
        codeSnippet: "# Original: 1 -> 2 -> 3 -> None\nhead.next = head.next.next",
        options: ["1 -> 3 -> None", "1 -> 2 -> None", "2 -> 3 -> None", "Error"],
        correctAnswer: "1 -> 3 -> None",
        explanation: "head.next (jo node 2 thi) ko head.next.next (node 3) se link kar diya gaya hai. Node 2 list se disconnect ho jayega."
      },
      {
        id: "dsa_03_q3",
        type: "mcq",
        question: "Singly Linked List me kisi node ko delete karne ke liye kya zaroori hai?",
        options: ["Us node ka data", "Us node se pehle wale node ka address", "List ki total length", "Last node ka address"],
        correctAnswer: "Us node se pehle wale node ka address",
        explanation: "Kyunki previous node ke 'next' pointer ko delete hone wale node ke 'next' se link karna padega."
      },
      {
        id: "dsa_03_code1",
        type: "code_writing",
        question: "Ek function likho jo Linked List ke starting (head) me ek new Node insert kare. Function naya head return kare.",
        options: [],
        correctAnswer: "def insert_at_head(head, data):\n    new_node = Node(data)\n    new_node.next = head\n    return new_node",
        acceptedAnswers: ["def insert_at_head(head, data):\n    new_node = Node(data)\n    new_node.next = head\n    return new_node"],
        expectedOutput: "5",
        explanation: "Naya node banate hain, uska next purane head ko point karte hain, aur naye node ko naya head bana dete hain. Ye O(1) operation hai."
      }
    ]
  },
  {
    id: "dsa_04",
    tab: "basic",
    number: "04",
    title: "Stacks",
    iconKey: "list",
    xpReward: 75,
    theorySlides: [
      {
        heading: "What is a Stack?",
        body: "Stack ek LIFO (Last In, First Out) data structure hai. Jaise ki plates ka stack, jo plate sabse uper rakhi jati hai wo sabse pehle utari jati hai. Isme sirf top se hi operations ho sakte hain.",
        codeExample: "# Python list as stack\nstack = []\nstack.append('A') # Push\nstack.append('B')\nprint(stack) # ['A', 'B']"
      },
      {
        heading: "Stack Operations",
        body: "Push: Element ko stack me daalna (append).\nPop: Element ko stack se nikalna.\nPeek/Top: Top element ko dekhna bina nikale.\nisEmpty: Check karna stack khali hai ya nahi.",
        codeExample: "stack = [10, 20, 30]\nstack.append(40) # Push -> [10,20,30,40]\ntop = stack.pop() # Pop -> 40\nprint(stack) # [10,20,30]"
      },
      {
        heading: "Real-world Use Cases",
        body: "1. Undo/Redo functionality (Text Editors).\n2. Browser Back button (Last visited page pe jana).\n3. Function Call Stack (Recursion me functions kaise call hote hain).",
        codeExample: "# Browser Back Stack Example\nhistory = ['google.com', 'youtube.com']\n# Back button click\nlast_page = history.pop()\nprint(last_page) # 'youtube.com'"
      }
    ],
    quiz: [
      {
        id: "dsa_04_q1",
        type: "mcq",
        question: "Stack kis principle par kaam karta hai?",
        options: ["FIFO", "LIFO", "LILO", "Random"],
        correctAnswer: "LIFO",
        explanation: "LIFO (Last In, First Out) means jo element sabse baad me aaya hai, wo sabse pehle bahar jayega."
      },
      {
        id: "dsa_04_q2",
        type: "predict_output",
        question: "Is code ka output kya hoga?",
        codeSnippet: "s = []\ns.append(1)\ns.append(2)\ns.append(3)\nprint(s.pop())\nprint(s[-1])",
        options: ["3 and 2", "1 and 2", "3 and 3", "2 and 1"],
        correctAnswer: "3 and 2",
        explanation: "pop() last element 3 ko nikal dega aur print karega. s[-1] ab naya top element 2 ko print karega (Peek operation)."
      },
      {
        id: "dsa_04_q3",
        type: "mcq",
        question: "Recursion me internally kaunsa data structure use hota hai function calls ko track karne ke liye?",
        options: ["Queue", "Array", "Stack", "Graph"],
        correctAnswer: "Stack",
        explanation: "Call Stack use hota hai, jisme latest function call sabse uper hoti hai aur return hote waqt sabse pehle wo hi khatam hoti hai."
      },
      {
        id: "dsa_04_code1",
        type: "code_writing",
        question: "Ek function likho jo ek string le aur usko reverse karke return kare using Stack logic (append aur pop).",
        options: [],
        correctAnswer: "def reverse_string(s):\n    stack = []\n    for char in s:\n        stack.append(char)\n    reversed_str = ''\n    while stack:\n        reversed_str += stack.pop()\n    return reversed_str",
        acceptedAnswers: ["def reverse_string(s):\n    stack = []\n    for char in s:\n        stack.append(char)\n    reversed_str = ''\n    while stack:\n        reversed_str += stack.pop()\n    return reversed_str"],
        expectedOutput: "olleh",
        explanation: "String ke characters ko stack me dalkar pop karne par wo reverse order me aate hain kyunki Stack LIFO hai."
      }
    ]
  },
  {
    id: "dsa_05",
    tab: "basic",
    number: "05",
    title: "Queues",
    iconKey: "layers",
    xpReward: 75,
    theorySlides: [
      {
        heading: "What is a Queue?",
        body: "Queue ek FIFO (First In, First Out) data structure hai. Jaise ticket counter ki line, jo pehle aaya wo pehle ticket lega. Isme elements end me jaate hain aur front se nikalte hain.",
        codeExample: "# Python list as queue (Not efficient)\nqueue = []\nqueue.append('A') # Enqueue\nqueue.append('B')\nprint(queue.pop(0)) # Dequeue -> 'A'"
      },
      {
        heading: "Efficient Queues in Python",
        body: "List me pop(0) O(n) time leta hai. Isliye Python me efficient queue ke liye `collections.deque` use karte hain. Isme popleft() O(1) me kaam karta hai.",
        codeExample: "from collections import deque\nq = deque()\nq.append('A') # Enqueue\nq.append('B')\nprint(q.popleft()) # Dequeue -> 'A' (O(1) operation)"
      },
      {
        heading: "Types of Queues",
        body: "1. Simple Queue: Normal FIFO.\n2. Circular Queue: Last element pehle se connect hota hai.\n3. Priority Queue: Element priority ke hisaab se nikalte hain.\n4. Double Ended Queue (Deque): Dono side se add/remove ho sakta hai.",
        codeExample: "# Priority Queue Concept\nimport heapq\npq = []\nheapq.heappush(pq, (2, 'Task 2'))\nheapq.heappush(pq, (1, 'Task 1'))\nprint(heapq.heappop(pq)) # (1, 'Task 1')"
      }
    ],
    quiz: [
      {
        id: "dsa_05_q1",
        type: "mcq",
        question: "Queue kis principle par kaam karta hai?",
        options: ["LIFO", "FIFO", "Random", "Priority based always"],
        correctAnswer: "FIFO",
        explanation: "FIFO (First In, First Out) means jo element sabse pehle line me aaya hai, wo sabse pehle bahar jayega."
      },
      {
        id: "dsa_05_q2",
        type: "predict_output",
        question: "Is code ka output kya hoga?",
        codeSnippet: "from collections import deque\nq = deque([10, 20, 30])\nq.append(40)\nq.popleft()\nprint(list(q))",
        options: ["[20, 30, 40]", "[10, 20, 30]", "[10, 20, 30, 40]", "[40]"],
        correctAnswer: "[20, 30, 40]",
        explanation: "append(40) list me 40 add karega aur popleft() starting ka 10 nikal dega. Result [20, 30, 40] hoga."
      },
      {
        id: "dsa_05_q3",
        type: "mcq",
        question: "Python list `pop(0)` use karne ki time complexity kyun O(n) hai?",
        options: ["Kyunki list reverse hoti hai", "Kyunki baaki ke elements ko left shift karna padta hai", "Kyunki 0 index hota hai", "Kyunki memory allocate hoti hai"],
        correctAnswer: "Kyunki baaki ke elements ko left shift karna padta hai",
        explanation: "Jab hum 0th index pop karte hain, toh 1st index 0th ban jata hai, 2nd 1st... sabko shift karna padta hai, jo O(n) time leta hai."
      },
      {
        id: "dsa_05_code1",
        type: "code_writing",
        question: "Using `collections.deque`, ek function likho jo queue me ek element add kare (enqueue) aur ek element remove kare (dequeue), aur removed element return kare.",
        options: [],
        correctAnswer: "def queue_operations(q, item):\n    q.append(item)\n    return q.popleft()",
        acceptedAnswers: ["def queue_operations(q, item):\n    q.append(item)\n    return q.popleft()"],
        expectedOutput: "1",
        explanation: "Hum item append karte hain end me aur popleft() se front se element nikalte hain."
      }
    ]
  },
  {
    id: "dsa_06",
    tab: "basic",
    number: "06",
    title: "Trees",
    iconKey: "git-branch",
    xpReward: 85,
    theorySlides: [
      {
        heading: "What is a Tree?",
        body: "Tree ek hierarchical (non-linear) data structure hai. Isme ek 'Root' node hota hai, aur usse branches nikalte hain. Real-world example: Family tree, File system folders.",
        codeExample: "class TreeNode:\n  def __init__(self, data):\n    self.data = data\n    self.children = []\n    self.parent = None"
      },
      {
        heading: "Binary Trees",
        body: "Ek tree jisme har node ke maximum 2 children (Left aur Right) ho sakte hain, usse Binary Tree kehte hain. Ye searching aur sorting algorithms ka base hai.",
        codeExample: "class BinaryTreeNode:\n  def __init__(self, data):\n    self.data = data\n    self.left = None\n    self.right = None"
      },
      {
        heading: "Tree Traversals",
        body: "Tree ke nodes ko visit karne ke 3 main ways hain (Depth First):\n1. Inorder: Left -> Root -> Right\n2. Preorder: Root -> Left -> Right\n3. Postorder: Left -> Right -> Root",
        codeExample: "def inorder(node):\n  if node is None: return\n  inorder(node.left)\n  print(node.data)\n  inorder(node.right)"
      },
      {
        heading: "Binary Search Tree (BST)",
        body: "BST ek Binary Tree hai jisme Left child hamesha Root se chhota aur Right child hamesha Root se bada hota hai. BST me searching O(log n) me hoti hai.",
        codeExample: "# BST Rule\n#      10\n#     /  \\\n#    5    15  -> 5 < 10, 15 > 10"
      }
    ],
    quiz: [
      {
        id: "dsa_06_q1",
        type: "mcq",
        question: "Binary Tree me kisi node ke maximum kitne children ho sakte hain?",
        options: ["1", "2", "3", "Unlimited"],
        correctAnswer: "2",
        explanation: "Binary means two. Isliye ek node ke sirf 2 children (Left aur Right) ho sakte hain."
      },
      {
        id: "dsa_06_q2",
        type: "predict_output",
        question: "Inorder Traversal ka output kya hoga is BST ke liye?\nRoot=10, Left=5, Right=15",
        codeSnippet: "def inorder(node):\n  if not node: return\n  inorder(node.left)\n  print(node.data, end=' ')\n  inorder(node.right)",
        options: ["10 5 15", "5 10 15", "15 10 5", "5 15 10"],
        correctAnswer: "5 10 15",
        explanation: "Inorder traversal Left -> Root -> Right hota hai. Pehle 5, phir 10, phir 15 print hoga."
      },
      {
        id: "dsa_06_q3",
        type: "mcq",
        question: "Ek valid Binary Search Tree (BST) me, Root node ka right child hamesha kaisa hoga?",
        options: ["Root se chhota", "Root se bada", "Root ke barabar", "Kuch bhi ho sakta hai"],
        correctAnswer: "Root se bada",
        explanation: "BST ka rule hai ki left subtree ke values chhoti hoti hain aur right subtree ki values badi hoti hain root se."
      },
      {
        id: "dsa_06_code1",
        type: "code_writing",
        question: "Ek function likho jo BST me ek target search kare. Agar mil jaye toh True, warna False return kare. (Node class: node.data, node.left, node.right)",
        options: [],
        correctAnswer: "def search_bst(node, target):\n    if node is None:\n        return False\n    if node.data == target:\n        return True\n    if target < node.data:\n        return search_bst(node.left, target)\n    else:\n        return search_bst(node.right, target)",
        acceptedAnswers: ["def search_bst(node, target):\n    if node is None:\n        return False\n    if node.data == target:\n        return True\n    if target < node.data:\n        return search_bst(node.left, target)\n    else:\n        return search_bst(node.right, target)"],
        expectedOutput: "True",
        explanation: "Agar target chhota hai toh left me jao, bada hai toh right me. Ye O(log n) me element dhundh leta hai."
      }
    ]
  },
  {
    id: "dsa_07",
    tab: "basic",
    number: "07",
    title: "Graphs",
    iconKey: "folder-tree",
    xpReward: 90,
    theorySlides: [
      {
        heading: "What is a Graph?",
        body: "Graph ek non-linear data structure hai jo nodes (Vertices) aur unhe jodne wali lines (Edges) se bana hota hai. Ye Tree se different hai kyunki Graph me cycles ho sakti hain aur nodes beech me kisi bhi direction me connected ho sakte hain.",
        codeExample: "# Graph representation using Dictionary\ngraph = {\n  'A': ['B', 'C'],\n  'B': ['A', 'D'],\n  'C': ['A'],\n  'D': ['B']\n}"
      },
      {
        heading: "Directed vs Undirected",
        body: "Undirected Graph: Edges ka direction nahi hota (A-B matlab dono ja sakte hain).\nDirected Graph (Digraph): Edges ka direction hota hai (A->B matlab A se B ja sakte hain, par B se A nahi).",
        codeExample: "# Directed Graph\ngraph = {\n  'A': ['B'], # A se B ja sakte hain\n  'B': ['C'], # B se C ja sakte hain\n  'C': []\n}"
      },
      {
        heading: "BFS (Breadth First Search)",
        body: "BFS me hum root se shuru karte hain aur pehle uske sabhi neighbors visit karte hain, phir unke neighbors ko. Isme Queue ka use hota hai. Shortest path dhoondhne ke liye use hota hai.",
        codeExample: "from collections import deque\ndef bfs(graph, start):\n  visited = set([start])\n  queue = deque([start])\n  while queue:\n    node = queue.popleft()\n    for neighbor in graph[node]:\n      if neighbor not in visited:\n        visited.add(neighbor)\n        queue.append(neighbor)"
      },
      {
        heading: "DFS (Depth First Search)",
        body: "DFS me hum ek raaste par jaha tak ja sakte hain jaate hain (deep me), jab tak dead end na aaye. Wapas aakar dusre raaste par jate hain. Isme Stack ya Recursion use hota hai.",
        codeExample: "def dfs(graph, node, visited=None):\n  if visited is None: visited = set()\n  if node in visited: return\n  visited.add(node)\n  print(node)\n  for neighbor in graph[node]:\n    dfs(graph, neighbor, visited)"
      }
    ],
    quiz: [
      {
        id: "dsa_07_q1",
        type: "mcq",
        question: "Graph me nodes ko kya kehte hain aur unhe jodne wali lines ko?",
        options: ["Nodes & Links", "Vertices & Edges", "Points & Lines", "Elements & Paths"],
        correctAnswer: "Vertices & Edges",
        explanation: "Graph theory me nodes ko Vertices aur unhe jodne wali lines ko Edges kehte hain."
      },
      {
        id: "dsa_07_q2",
        type: "mcq",
        question: "Shortest path find karne ke liye generally kaunsa algorithm use hota hai?",
        options: ["DFS", "BFS", "Linear Search", "Binary Search"],
        correctAnswer: "BFS",
        explanation: "BFS level by level search karta hai, isliye destination tak pahunchne ka sabse chhota raasta (shortest path) pehle mil jata hai."
      },
      {
        id: "dsa_07_q3",
        type: "predict_output",
        question: "Is Graph par DFS traversal ka output kya hoga (Start = 'A')?\ngraph = {'A': ['B', 'C'], 'B': ['D'], 'C': [], 'D': []}",
        codeSnippet: "def dfs(graph, node, visited=None):\n    if visited is None: visited = set()\n    if node in visited: return\n    visited.add(node)\n    print(node, end=' ')\n    for n in sorted(graph[node]):\n        dfs(graph, n, visited)",
        options: ["A B C D", "A B D C", "A C B D", "D B C A"],
        correctAnswer: "A B D C",
        explanation: "DFS deep me jata hai. A se B, B se D, D ka koi neighbor nahi toh backtrack karke A ka C visit hoga."
      },
      {
        id: "dsa_07_code1",
        type: "code_writing",
        question: "Ek function likho jo Graph me BFS traversal kare aur visited nodes ki list return kare. (Queue use karo)",
        options: [],
        correctAnswer: "def bfs(graph, start):\n    visited = []\n    queue = deque([start])\n    seen = set([start])\n    while queue:\n        node = queue.popleft()\n        visited.append(node)\n        for neighbor in graph[node]:\n            if neighbor not in seen:\n                seen.add(neighbor)\n                queue.append(neighbor)\n    return visited",
        acceptedAnswers: ["def bfs(graph, start):\n    visited = []\n    queue = deque([start])\n    seen = set([start])\n    while queue:\n        node = queue.popleft()\n        visited.append(node)\n        for neighbor in graph[node]:\n            if neighbor not in seen:\n                seen.add(neighbor)\n                queue.append(neighbor)\n    return visited"],
        expectedOutput: "['A', 'B', 'C']",
        explanation: "BFS me Queue use hoti hai aur pehle current node ke sabhi neighbors visit hote hain."
      }
    ]
  },
  {
    id: "dsa_08",
    tab: "basic",
    number: "08",
    title: "Hashing",
    iconKey: "eye-off",
    xpReward: 80,
    theorySlides: [
      {
        heading: "What is Hashing?",
        body: "Hashing ek aisa technique hai jo kisi bhi data ko ek fixed-size unique value (Hash Code) me convert kar deta hai. Python me Dictionary (dict) hashing par hi based hai.",
        codeExample: "# Python Dictionary uses Hashing\nstudent = {'name': 'Rahul', 'age': 20}\nprint(student['name']) # O(1) lookup"
      },
      {
        heading: "How Hash Tables Work?",
        body: "Hash Table ek array hoti hai. Jab hum key-value store karte hain, toh key par ek hash function lagaya jata hai jo ek index generate karta hai, aur value us index par store hoti hai. Isliye search O(1) me hota hai.",
        codeExample: "# Concept (Internal working)\n# key = 'name'\n# index = hash('name') % array_size\n# array[index] = 'Rahul'"
      },
      {
        heading: "Hash Collisions",
        body: "Kabhi kabhi 2 alag-alag keys ka hash index same aa jata hai, isse Collision kehte hain. ise handle karne ke 2 main ways hain: 1. Chaining (us index par linked list bana dena), 2. Open Addressing (khaali index dhoondhna).",
        codeExample: "# Collision Concept:\nhash('A') -> index 4\nhash('B') -> index 4 (Collision!)\n# Chaining: array[4] = [('A', val1), ('B', val2)]"
      },
      {
        heading: "Hashable vs Unhashable",
        body: "Python me sirf immutable (jo change na ho sake) objects hi dictionary ki key ban sakte hain (e.g., Strings, Numbers, Tuples). Lists aur Dictionaries mutable hain, isliye ye keys nahi ban sakte.",
        codeExample: "valid_dict = {(1,2): 'Tuple key'}\n# invalid_dict = {[1,2]: 'List key'} -> TypeError!"
      }
    ],
    quiz: [
      {
        id: "dsa_08_q1",
        type: "mcq",
        question: "Average case me Hash Table (Dictionary) me kisi element ko search karne ki time complexity kya hoti hai?",
        options: ["O(n)", "O(log n)", "O(1)", "O(n^2)"],
        correctAnswer: "O(1)",
        explanation: "Hash function direct index calculate kar deta hai, isliye average case me data milna O(1) (Constant time) me hota hai."
      },
      {
        id: "dsa_08_q2",
        type: "mcq",
        question: "Hash Collision kya hota hai?",
        options: ["Jab memory full ho jaye", "Jab do alag keys ka hash index same a jaye", "Jab value missing ho", "Jab key string ho"],
        correctAnswer: "Jab do alag keys ka hash index same a jaye",
        explanation: "Collision tab hota hai jab hash function ki wajah se alag-alag data same memory location par map ho jaye."
      },
      {
        id: "dsa_08_q3",
        type: "predict_output",
        question: "Is code ka output kya hoga?",
        codeSnippet: "d = {'a': 1, 'b': 2}\nd['a'] = 99\nkeys = list(d.keys())\nprint(keys)",
        options: ["['a', 'b', 'a']", "['a', 'b']", "[1, 99]", "Error"],
        correctAnswer: "['a', 'b']",
        explanation: "Dictionary me keys unique hoti hain. 'a' ki value update hone par naya key add nahi hoga, purana update hoga."
      },
      {
        id: "dsa_08_code1",
        type: "code_writing",
        question: "Ek function likho jo ek list of numbers le aur return kare ki kaunsa number kitni baar aaya hai. (Dictionary / Hash Map use karo). Example: [1,2,2,3] -> {1:1, 2:2, 3:3}",
        options: [],
        correctAnswer: "def count_freq(arr):\n    freq = {}\n    for num in arr:\n        if num in freq:\n            freq[num] += 1\n        else:\n            freq[num] = 1\n    return freq",
        acceptedAnswers: ["def count_freq(arr):\n    freq = {}\n    for num in arr:\n        if num in freq:\n            freq[num] += 1\n        else:\n            freq[num] = 1\n    return freq"],
        expectedOutput: "{1: 1, 2: 2, 3: 1}",
        explanation: "Hash map (dictionary) me frequency count karna O(n) me hota hai, jo O(n^2) list search se fast hai."
      }
    ]
  },
  {
    id: "dsa_09",
    tab: "basic",
    number: "09",
    title: "Searching\nAlgorithms",
    iconKey: "gift",
    xpReward: 80,
    theorySlides: [
      {
        heading: "Linear Search",
        body: "Linear Search me hum array ke har ek element ko ek ek karke check karte hain jab tak target na mil jaye. Ye unsorted array ke liye kaam aata hai. Time Complexity: O(n).",
        codeExample: "def linear_search(arr, target):\n  for i in range(len(arr)):\n    if arr[i] == target:\n      return i\n  return -1"
      },
      {
        heading: "Binary Search",
        body: "Binary Search ek fast search algorithm hai jo SIRF sorted array par kaam karta hai. Ye middle element check karta hai, agar target bada hai toh right half me dhoondhta hai, nhi toh left half me. Time Complexity: O(log n).",
        codeExample: "# Sorted Array is must for Binary Search!\narr = [1, 3, 5, 7, 9]"
      },
      {
        heading: "Implementing Binary Search",
        body: "Binary search me hum 2 pointers use karte hain (low aur high). Jab tak low chhota ya barabar hai high ke, tab tak middle find karte hain aur search space ko half karte jate hain.",
        codeExample: "def binary_search(arr, target):\n  low, high = 0, len(arr) - 1\n  while low <= high:\n    mid = (low + high) // 2\n    if arr[mid] == target: return mid\n    elif arr[mid] < target: low = mid + 1\n    else: high = mid - 1\n  return -1"
      }
    ],
    quiz: [
      {
        id: "dsa_09_q1",
        type: "mcq",
        question: "Binary Search ke kaam karne ke liye kya zaroori hai?",
        options: ["Array me duplicates na hon", "Array sorted ho", "Array ka size even ho", "Array me sirf integers hon"],
        correctAnswer: "Array sorted ho",
        explanation: "Binary search mid element se compare karke decide karta hai ki left jaye ya right. Ye sirf tab possible hai jab array sorted ho."
      },
      {
        id: "dsa_09_q2",
        type: "mcq",
        question: "1 million (10^6) elements ke sorted array me Binary Search se element dhoondhne me maximum kitne steps lagenge?",
        options: ["1 million steps", "500,000 steps", "20 steps (approx)", "10 steps"],
        correctAnswer: "20 steps (approx)",
        explanation: "Binary search O(log n) hai. log2(1,000,000) lagbhag 20 hota hai. Matlab sirf 20 comparisons me 10 lakh me se element mil jayega!"
      },
      {
        id: "dsa_09_q3",
        type: "predict_output",
        question: "Is sorted array me binary_search(7) kya return karega?\narr = [2, 4, 6, 7, 10]",
        codeSnippet: "def binary_search(arr, target):\n    low, high = 0, len(arr)-1\n    while low <= high:\n        mid = (low+high)//2\n        if arr[mid] == target: return mid\n        elif arr[mid] < target: low = mid+1\n        else: high = mid-1\n    return -1\n\nprint(binary_search([2,4,6,7,10], 7))",
        options: ["1", "2", "3", "4"],
        correctAnswer: "3",
        explanation: "Mid pehle 6(index 2) aayega, 7 bada hai toh right jayega. Naya mid 7(index 3) hoga aur match ho jayega."
      },
      {
        id: "dsa_09_code1",
        type: "code_writing",
        question: "Ek function likho jo Binary Search ka use karke sorted list me target dhoondhe. Agar mile toh uska index, warna -1 return kare.",
        options: [],
        correctAnswer: "def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1",
        acceptedAnswers: ["def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1"],
        expectedOutput: "2",
        explanation: "Binary search search space ko har step par half kar deta hai, isliye ye O(log n) me kaam karta hai."
      }
    ]
  },
  {
    id: "dsa_10",
    tab: "basic",
    number: "10",
    title: "Sorting\nAlgorithms",
    iconKey: "controlFlow",
    xpReward: 85,
    theorySlides: [
      {
        heading: "Why Sorting?",
        body: "Sorted data me searching (Binary Search) bahut fast ho jata hai. Sorting data ko analyze karna aur duplicate find karna aasan bana deta hai. Python me built-in sort() method hai, par algorithms samajhna zaroori hai.",
        codeExample: "# Python built-in sorting (Timsort)\narr = [5, 2, 8, 1]\narr.sort()\nprint(arr) # [1, 2, 5, 8]"
      },
      {
        heading: "Bubble Sort",
        body: "Bubble Sort adjacent elements ko compare karta hai aur agar wo galat order me hain toh swap kar deta hai. Har iteration me sabse bada element end me chala jata hai. Time Complexity: O(n^2).",
        codeExample: "def bubble_sort(arr):\n  n = len(arr)\n  for i in range(n):\n    for j in range(0, n-i-1):\n      if arr[j] > arr[j+1]:\n        arr[j], arr[j+1] = arr[j+1], arr[j]"
      },
      {
        heading: "Merge Sort",
        body: "Merge Sort 'Divide and Conquer' technique use karta hai. Pehle array ko tab tak chhote parts me divide karta hai jab tak 1 element na bache, phir unhe sorted order me merge karta hai. Time Complexity: O(n log n).",
        codeExample: "def merge_sort(arr):\n  if len(arr) > 1:\n    mid = len(arr) // 2\n    left = arr[:mid]\n    right = arr[mid:]\n    merge_sort(left)\n    merge_sort(right)\n    # Merge logic..."
      },
      {
        heading: "Quick Sort",
        body: "Quick Sort bhi Divide and Conquer use karta hai. Isme ek 'Pivot' element choose kiya jata hai, aur array ko 2 parts me divide kiya jata hai: Pivot se chhote aur Pivot se bade. Phir recursively sort kiya jata hai.",
        codeExample: "def quick_sort(arr):\n  if len(arr) <= 1: return arr\n  pivot = arr[len(arr)//2]\n  left = [x for x in arr if x < pivot]\n  middle = [x for x in arr if x == pivot]\n  right = [x for x in arr if x > pivot]\n  return quick_sort(left) + middle + quick_sort(right)"
      }
    ],
    quiz: [
      {
        id: "dsa_10_q1",
        type: "mcq",
        question: "Bubble Sort ki worst-case time complexity kya hoti hai?",
        options: ["O(n)", "O(log n)", "O(n^2)", "O(n log n)"],
        correctAnswer: "O(n^2)",
        explanation: "Bubble sorting me nested loops hote hain, isliye agar array reverse sorted ho toh O(n^2) comparisons aur swaps lagte hain."
      },
      {
        id: "dsa_10_q2",
        type: "mcq",
        question: "Kaunsa sorting algorithm 'Divide and Conquer' strategy par kaam karta hai?",
        options: ["Bubble Sort", "Insertion Sort", "Selection Sort", "Merge Sort"],
        correctAnswer: "Merge Sort",
        explanation: "Merge sort array ko chhote parts me divide karta hai (Conquer) aur phir sorted parts ko merge karta hai."
      },
      {
        id: "dsa_10_q3",
        type: "predict_output",
        question: "Is code ka output kya hoga?",
        codeSnippet: "arr = [3, 1, 2]\nfor i in range(len(arr)):\n    for j in range(0, len(arr)-i-1):\n        if arr[j] > arr[j+1]:\n            arr[j], arr[j+1] = arr[j+1], arr[j]\nprint(arr)",
        options: ["[1, 2, 3]", "[3, 2, 1]", "[3, 1, 2]", "[2, 1, 3]"],
        correctAnswer: "[1, 2, 3]",
        explanation: "Ye Bubble Sort ka code hai jo array ko ascending order me sort kar dega."
      },
      {
        id: "dsa_10_code1",
        type: "code_writing",
        question: "Quick Sort ka logic use karke ek function likho jo list of numbers ko sort kare aur sorted list return kare.",
        options: [],
        correctAnswer: "def quick_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quick_sort(left) + middle + quick_sort(right)",
        acceptedAnswers: ["def quick_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quick_sort(left) + middle + quick_sort(right)"],
        expectedOutput: "[1, 2, 3, 4, 5]",
        explanation: "Pivot ke around list ko divide karna aur recursively sort karna Quick Sort ka basic principle hai."
      }
    ]
  },
  {
    id: "dsa_11",
    tab: "basic",
    number: "11",
    title: "Recursion &\nBacktracking",
    iconKey: "repeat",
    xpReward: 90,
    theorySlides: [
      {
        heading: "What is Recursion?",
        body: "Jab ek function apne aap ko hi call karta hai, usse Recursion kehte hain. Recursive function me 2 parts hote hain: 1. Base Case (Rukne ki condition), 2. Recursive Case (Function khud ko call karta hai).",
        codeExample: "def factorial(n):\n  if n == 1: # Base Case\n    return 1\n  else: # Recursive Case\n    return n * factorial(n-1)"
      },
      {
        heading: "The Call Stack",
        body: "Recursion ke piche Call Stack ka concept hota hai. Jab function khud ko call karta hai, pura function stack me push hota jata hai. Jab base case mil jata hai, toh functions stack se ek ek karke pop hote hain aur value return hoti hai.",
        codeExample: "# factorial(3) call stack:\n# 3 * factorial(2)\n# 2 * factorial(1)\n# 1 (Base case hits!)\n# Returns: 1 -> 2*1 -> 3*2*1 = 6"
      },
      {
        heading: "What is Backtracking?",
        body: "Backtracking ek problem-solving technique hai jisme hum ek option try karte hain, agar wo galat hai toh uspe wapas aate hain (backtrack) aur dusra option try karte hain. Ye Recursion par hi based hai. Example: Maze, Sudoku.",
        codeExample: "# Concept of Backtracking\ndef solve():\n  for option in options:\n    if is_valid(option):\n      take_step(option)\n      solve() # Move forward\n      undo_step(option) # Backtrack"
      },
      {
        heading: "Classic Backtracking: Permutations",
        body: "Permutations ka matlab hai elements ko rearrange karna. Backtracking se hum sabhi possible arrangements generate kar sakte hain. Har step me ek element choose karo, aage badho, aur jab kaam ho jaye toh hata do (backtrack).",
        codeExample: "def permute(arr, path=[]):\n  if not arr:\n    print(path)\n    return\n  for i in range(len(arr)):\n    permute(arr[:i]+arr[i+1:], path+[arr[i]])"
      }
    ],
    quiz: [
      {
        id: "dsa_11_q1",
        type: "mcq",
        question: "Recursion me Base Case kya hota hai?",
        options: ["Jab function infinite loop me padta hai", "Jab function khud ko call karta hai", "Wo condition jahan function ruk jata hai aur return karta hai", "Jab function kisi dusre function ko call karta hai"],
        correctAnswer: "Wo condition jahan function ruk jata hai aur return karta hai",
        explanation: "Base case rukne ki condition hai. Bina iske recursion infinite chalta rahega aur Stack Overflow error aayega."
      },
      {
        id: "dsa_11_q2",
        type: "predict_output",
        question: "Is recursive function ka output kya hoga?",
        codeSnippet: "def mystery(n):\n    if n <= 0:\n        return 0\n    return n + mystery(n-1)\n\nprint(mystery(3))",
        options: ["3", "6", "0", "Error"],
        correctAnswer: "6",
        explanation: "mystery(3) = 3 + mystery(2) -> 3 + 2 + mystery(1) -> 3 + 2 + 1 + 0 = 6. Ye 1 se n tak ka sum hai."
      },
      {
        id: "dsa_11_q3",
        type: "mcq",
        question: "Backtracking me jab koi path galat nikalta hai, toh hum kya karte hain?",
        options: ["Program crash kar dete hain", "Wapas us point par aate hain jahan se galat decision li thi aur naya option try karte hain", "Base case ko change kar dete hain", "Pura stack clear kar dete hain"],
        correctAnswer: "Wapas us point par aate hain jahan se galat decision li thi aur naya option try karte hain",
        explanation: "Isi liye ise Backtracking (piche jana) kehte hain. Hum galat step ko undo karke naya step try karte hain."
      },
      {
        id: "dsa_11_code1",
        type: "code_writing",
        question: "Recursive function likho jo Fibonacci number return kare. (fib(0)=0, fib(1)=1, fib(n)=fib(n-1)+fib(n-2)).",
        options: [],
        correctAnswer: "def fib(n):\n    if n == 0:\n        return 0\n    if n == 1:\n        return 1\n    return fib(n-1) + fib(n-2)",
        acceptedAnswers: ["def fib(n):\n    if n == 0:\n        return 0\n    if n == 1:\n        return 1\n    return fib(n-1) + fib(n-2)"],
        expectedOutput: "5",
        explanation: "Fibonacci recursion ka sabse classic example hai. fib(5) return karega 5."
      }
    ]
  },
  {
    id: "dsa_12",
    tab: "basic",
    number: "12",
    title: "Dynamic\nProgramming",
    iconKey: "database",
    xpReward: 90,
    theorySlides: [
      {
        heading: "What is Dynamic Programming (DP)?",
        body: "Dynamic Programming ek optimization technique hai jisme hum complex problem ko chhote sub-problems me todte hain, unka solution store kar lete hain, taaki dubara calculate na karna pade. Isse 'Overlapping Subproblems' se bacha ja sakta hai.",
        codeExample: "# Normal Recursion (Slow - Overlapping)\ndef fib(n):\n  if n <= 1: return n\n  return fib(n-1) + fib(n-2) # fib(3) calculated multiple times!"
      },
      {
        heading: "Memoization (Top-Down)",
        body: "Memoization me hum results ko ek dictionary ya list me store (cache) kar lete hain. Agar same sub-problem dubara aaye toh direct stored value return kar dete hain, recursive calls nahi karte.",
        codeExample: "memo = {}\ndef fib_memo(n):\n  if n in memo: return memo[n]\n  if n <= 1: return n\n  memo[n] = fib_memo(n-1) + fib_memo(n-2)\n  return memo[n]"
      },
      {
        heading: "Tabulation (Bottom-Up)",
        body: "Tabulation me hum recursion use nahi karte. Balki ek table (array) banaate hain aur base case se start karke iteratively aage ki values calculate karte hain. Ye Memoization se zyada efficient hota hai (No recursion overhead).",
        codeExample: "def fib_tab(n):\n  dp = [0] * (n+1)\n  dp[1] = 1\n  for i in range(2, n+1):\n    dp[i] = dp[i-1] + dp[i-2]\n  return dp[n]"
      },
      {
        heading: "DP Problem Identification",
        body: "DP tab use karte hain jab:\n1. Overlapping Subproblems hon (Same sub-issues repeat hon).\n2. Optimal Substructure ho (Bade problem ka solution chhote solutions par depend kare). Common problems: Knapsack, Climbing Stairs, Longest Common Subsequence.",
        codeExample: "# Climbing Stairs (1 or 2 steps)\ndef climb(n):\n  if n <= 2: return n\n  dp = [0]*(n+1)\n  dp[1], dp[2] = 1, 2\n  for i in range(3, n+1):\n    dp[i] = dp[i-1] + dp[i-2]\n  return dp[n]"
      }
    ],
    quiz: [
      {
        id: "dsa_12_q1",
        type: "mcq",
        question: "Dynamic Programming ka main idea kya hai?",
        options: ["Problem ko aur complex banana", "Subproblems ke solutions ko store karke repeated calculations se bachna", "Sirf recursion use karna", "Greedy approach use karna"],
        correctAnswer: "Subproblems ke solutions ko store karke repeated calculations se bachna",
        explanation: "DP me already calculated values ko store (memoize) kar liya jata hai, taki time bach sake."
      },
      {
        id: "dsa_12_q2",
        type: "mcq",
        question: "Memoization aur Tabulation me se kaunsa approach iterative (loop) use karta hai?",
        options: ["Memoization", "Tabulation", "Dono", "Koi bhi nahi"],
        correctAnswer: "Tabulation",
        explanation: "Tabulation (Bottom-up) me hum loop chalate hain aur table bharate hain, jabki Memoization (Top-down) me recursion use hota hai."
      },
      {
        id: "dsa_12_q3",
        type: "predict_output",
        question: "Is Tabulation code ka output kya hoga?",
        codeSnippet: "def climb(n):\n    dp = [0]*(n+1)\n    dp[1] = 1\n    dp[2] = 2\n    for i in range(3, n+1):\n        dp[i] = dp[i-1] + dp[i-2]\n    return dp[n]\n\nprint(climb(4))",
        options: ["3", "5", "4", "2"],
        correctAnswer: "5",
        explanation: "dp[1]=1, dp[2]=2, dp[3]=dp[2]+dp[1]=3, dp[4]=dp[3]+dp[2]=5. Climbing stairs ka answer 5 hoga."
      },
      {
        id: "dsa_12_code1",
        type: "code_writing",
        question: "Tabulation (Bottom-Up DP) ka use karke function likho jo nth Fibonacci number calculate kare. (dp array banao).",
        options: [],
        correctAnswer: "def fib_tab(n):\n    if n == 0: return 0\n    dp = [0] * (n + 1)\n    dp[1] = 1\n    for i in range(2, n + 1):\n        dp[i] = dp[i-1] + dp[i-2]\n    return dp[n]",
        acceptedAnswers: ["def fib_tab(n):\n    if n == 0: return 0\n    dp = [0] * (n + 1)\n    dp[1] = 1\n    for i in range(2, n + 1):\n        dp[i] = dp[i-1] + dp[i-2]\n    return dp[n]"],
        expectedOutput: "55",
        explanation: "Iterative DP approach me hum neeche se upar values calculate karte hain, jo O(n) time aur O(n) space me kaam karta hai."
      }
    ]
  }
]