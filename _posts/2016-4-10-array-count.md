---
layout: post
title: 'Learning in playgrounds with generics and hashable Part 1'
type: post
permalink: /:categories/:year/learning-in-playgrounds-1
published: true
status: publish
tags:
- ios
---

I'll often catch myself asking our lead developer simply technical questions that I can easily google. And overtime I do it, I'll get the answer, "Try it out in the console!"

Of course, these questions need to be small, yet fundamental enough that it would be more worthwhile to see the answer proven with your eyes than the super approved answer on Stack Overflow.

<!--more-->

Initially, it seemed like a bit trivial having to go out and learn it the hard way, but I'm sure any well versed programmer will tell you the same.

I've been coding heavily in Swift as of late (I really like it) with my current side project, and I noticed how often I'm using functional programming methods in my codebase. Instead of looking at map, reduce and filter like a black box, I wanted to figure out exactly how those methods were implemented.
<br/>

### Try it in the console

It's really try it in XCode's Playground since we're coding in Swift, but you get the point. One question I've run into before during an interview was to **find the repeat count for each word in a string.** At the time, I had just come out of a great summer code called the Flatiron School in NYC. I got the question somewhat right but I was more nervous than I hoped to be. What better time than now to revisit and conquer old challenges?


Of course, I wanted to figure this problem out without googling for the clearest and most compact answer on Stack Overflow. Our brains wouldn't be doing much. And there's more fun in knowing you <a href="https://youtu.be/0O6A0Ote-fg?t=11">did it your way.</a>

I would begin by writing out the signature, parameters and return values for this function. The function should take an array of words and return  the number of times each word appears. So the string "dogs love dogs" should give back something like, dogs = 2, love = 1.
<br/>


```swift
func findWordCountForArray(arr: [￼String￼])-> [String: Int] {
  ...
}
```
<br/>

### I then thought, why does this method need to be just for strings?

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

## The return value
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

### The next post will be explain how to make structs and classes Hashable.

<br/>

Source Code for this post.
{% gist leojkwan/d65b7401bc321aceb617e0ccf93105df %}
