---
layout: post
title: 'Learning in playgrounds with generics and hashable Part 1'
type: post
categories:
published: true
comments: true
status: publish
tags:
- ios
- swift
---

Recently I've been making a habit to try things out in the node console or XCode playgrounds to better understand a technical concept.

Of course, these questions need to be small and fundamental enough that it's worth spending the extra time to prove something with your own eyes instead of the simply getting the answer on Stack Overflow.

<!--more-->

When I first started programming, it seemed so trivial to stop and learn things the 'right' way. Mainly, I felt like there were too many things I didn't know to even spend time focusing on ONE concept. You might disagree, but I feel where beginners come from when they're inclined to just google the right answer. Now that I've done a fair share of googling and blog post reading, and general self-improvement as a computer programmer, I feel more comfortable taking the bits of concepts and experience I've picked up over time to solve problems independently.

I've been coding heavily in Swift as of late (I really like it) with my current side project, and I noticed the incremental improvements I've been making as a programmer, such as adding functional paradigms into my swift code, introducing protocol oriented programming in some of my structs and classes, as well as considering time complexity and O-notation in my sort and find methods.

It's not super complex by any means, but I always value progress over current position, which in part helps me blog unapologetically on mistakes and shortcomings I run into as a programmer.
<br/>

#### Try it in the console

I wanted to understand generics better, and what better way to achieve that than to solve simple coding problems involving those concepts? One question I've run into before during an interview was to **find the repeat count for each word in a string.** At the time, I had just come out of a great summer code called the Flatiron School in NYC. I got the question somewhat right but I was more nervous than I hoped to be. Time to conquer old challenges!


Of course, I wanted to figure this problem out without googling for the clearest and most compact answer on Stack Overflow. Our brains wouldn't be doing much. And there's more fun in knowing you <a href="https://youtu.be/0O6A0Ote-fg?t=11">did it your way.</a>

I would begin by writing out the signature, parameters and return values for this function. The function should take an array of words and return  the number of times each word appears. So the string "dogs love dogs" should give back something like, dogs = 2, love = 1.
<br/>


```swift
func findWordCountForArray(arr: [￼String￼])-> [String: Int] {
  ...
}
```
<br/>

#### I then thought, why does this method need to be just for strings?

 This solution would be helpful for checking the repeat count of anything really: a string, a number, even a class! The last one is trickier so I'll delve into that more at the end. Nonetheless, this would call for the use of generics, a feature common in other programming languages, but only recently adopted in the forthcoming of Swift! Generics are things that aren't bound to a particular type. Since Swift is strongly typed, meaning the compiler wants to know what all your objects are and what you plan to do with them, it'd be pretty inconvenient to write multiple functions for our item-count-checker for each type.
<br>

```swift
func findObjectCountForArray(arr: [Object])-> [Object: Int] {
  ...
}

func findNumberCountForArray(arr: [Int])-> [Int: Int] {
  ...
}
```
<br>

That <T> in the angled brackets is the generic variable I mentioned earlier. That's the placeholder variable that is anything you want it to be. In this example, we're passing in an array of generic types to a function that will compute times each T repeats.

<br/>
<hr>

#### Solution
There's many ways to solve this problem. My solution is for this function to return a dictionary where the key is the generic item and the value is the number of times the generic item is in the array. The return value would look like T: In} making the final function declaration looks like

```swift
func findItemCountForArray<T:Hashable>(arr:[T]) -> [T: Int] {

  // 1
  var countDict = [T: Int]()

  for key in arr {
    // 2
    if countDict[key] == nil {
      countDict[key] = 0
    }
    // 3
    countDict[key]! += 1
  }

  return countDict
}

```

Try it out in the console. Take an array of strings, preferably with strings that repeat, and pass it into the function. Don't mind the Hashable keyword for now as I'll talk about that later. Just know that because generics hold objects, they can conform to protocols like any other object we deal with. Personally, declaring the function name was the harder part; the implementation is pretty straightforward.

1. Initialize a dictionary with our generic key and of Int value (repeat count of items)

2. Iterate over the passed in array, [T]. The element for each iteration will be the key. For example, if we pass in ["I", "love", "you"], the key for the first iteration is "I" and the value is dict["I"]. In each iteration, I would begin by checking if the key value is nil; otherwise, set it to 0 so we can increment the value in the step below.

3. Increment the key value by 1. If 'key' is a new word, the key value would be 1(0 + 1).

<br/>
If we pass an array some Taylor Swift lyrics, you'll see that we get back a dictionary of words with its respective count.


```
var tayLyrics = "Nice to meet you, where you been? I could show you incredible things Magic"

var stringArray = tayLyrics.componentsSeparatedByString(" ")   // ["Nice", "to", "meet", "you,", "where", "you", "incredible",...]

findItemCountForArray(stringArray)    // ["game,": 1, "there": 1, "God,": 1, "tie": 1, "I": 2, "madness,": 1, "to": 2, "Saw": 1, "show": 1 ...]
```

The cool part of this function is the generic array parameter. When we called 'findItemCountForArray' and passed in the array of lyrics, our placeholder, <T>, became a string and was interpreted as a string all throughout the implementation. Specifically, <T> was used as the key for our dictionary of word counts! That's pretty cool, and you'll see that if you pass in an array of Ints like [1,4,5,2,6,6,6], we'll get back a dictionary in which each unique number in the array is a key.

###### The next post will be explain how to make structs and classes Hashable.

<br/>

Source Code for this post.
{% gist leojkwan/d65b7401bc321aceb617e0ccf93105df %}
