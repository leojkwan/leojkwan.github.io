---
layout: post
title: 'Watch Connectivity with Core Data in iOS 10 Part 1'
type: post
status: draft
categories:
tags:
- ios
- swift 3
---

#### Integrating Core Data with WatchOS

Ever since I bought the apple watch when it first launched last year, I’ve been pretty disappointed with it's low load times and responsiveness. But it’s now late 2016 and a lot has changed since then. The Apple Watch now operates on WatchOS3, the third installment of the watch’s operating system, and after upgrading my watch, I've noticed the watch experience to feel just a bit snappier than before. It’s by no means as fast as how the Watch Series 2 looked in Apple’s demo launch earlier this month, but it works- I’ll take it.

<!--more-->

I decided to dabble with the WatchKit framework, while recognizing some new API’s introduced in iOS 10, specifically in Core Data. Up until now, developers would have to write their own core data stack contained in a separate class just to make sense of all that comes with handling managed object contexts. Not anymore. With the new NSPersistentContainer, your managed object model is created and already encapsulated within that class. Creating a mock in-memory persistent store for unit is even easier using NSPersistentContainer.

Putting both WatchOS and Core Data in mind, I explore the ease in which a core data stack can be created, as well as the existing APIs offered on WatchOS for watch connectivity.


This app is really simple- a table view controller with an alert prompt for adding your favorite snacks. The first milestone is syncing this table view onto the watch's table view. Specifically, whatever is added and deleted from the app's snack list will propagate to the watch.

---

##### **Watch and App Communication Design**
When creating a watch kit extension, you get two targets: the watchkit app containing UI storyboard files, and the watchkit extension, which houses all the domain logic of our app.

Both the app and the watch need to conform to the watch connectivity delegate in order to pass data between each other. They also need to begin a watchkit “session” before attempting to send data to its counterpart. I could go the easy route and have the application delegate and watchkit extension delegate house the connectivity logic, but that'll eventually lead to jumbled code in one place. Instead, this app contains two separate classes for delegating connectivity work: **PhoneToWatchService** and **WatchToPhoneService** for the app and watch, respectively. There is also a ’Recipe’ object model, our main resource that’s fetched from Core Data.

---

##### _Midway learnings and tips_
1. Of course, the watch cannot open its parent application if it's suspended. It needs to at least be in the background for the watch to make any communication with the app.
2. Unlike the appDelegate in our iOS apps, the 'rootInterfaceController' in our watch app is not yet initialized in the watchExtension's ‘applicationDidFinishLaunching’. I expected the code block below to work the same way we’d inject a dependency to a root view controller dependency in our app delegate.

{% highlight swift %}

let rootVC = WKExtension.shared().rootInterfaceController
rootVC.title = "Hello World"
{% endhighlight %}

Not true- The root interface controller is actually nil. Based on the documentation,

```
The root interface controller is located in the app’s main storyboard and has the Main Entry Point object associated with it. WatchKit displays the root interface controller at launch time, although the app can present a different interface controller before the launch sequence finishes.
```
{: style="text-align:justify;"}

<br>

 I’ll look more into the watch extension’s lifecycle, but to me our custom interface controller should be exist 'at launch time' in our method 'applicationDidFinishLaunching'. This poses a problem in our watch connectivity design. I'd like any information passed to the watch to solely be handled by a delegate, 'IncomingWatchInfoDelegate'. Because I can't set our rootInterfaceController's property 'applicationDidFinishLaunching', I'll check for the rootInterfaceController every time a payload arrives from the iOS app, and set our WatchToPhoneService's delegate to the controller once it exists.

---

#### Passing our managed object data to watch
There are several ways you can pass data between watch and app, so I won’t get too much into it as many other blogs discuss each in detail. The point to note is that almost all of the convenient watch connectivity apis relay your information through dictionary key value pairs. In addition, the dictionary can only contain property list types which are basic types such as strings, integers, floats and data. That’s a huge setback if we plan on fetching our recipe managed objects from the app. Fortunately, I have a type alias ‘WatchRecipe’ that is simply a dictionary representation of our Recipe object model. Since our recipe has only one attribute: ‘name’, the mapping from recipe to watch recipe is very straightforward.

{% highlight swift %}
let watchRecipes = recipes.map({ (recipe) -> WatchRecipe in
  return ["name": recipe.name as AnyObject]
})
{% endhighlight %}

After successfully sending a watch recipe over the transferUserInfo watch API, it’s pretty straightforward from there- we need to take these watch recipe dictionaries and update our watch table view. The watch paradigm is somewhat different from how we traditionally approach and setup our table view’s UITableViewDelegate and UITableViewDatasource methods. For one thing, there aren’t any delegate or datasource methods to conform to in order to present a tableview. You actually set the number of rows and the cell identifier, or “RowType” in one method. Secondly, the table rows are called rowControllers. Instead of cellForRowAtIndexPath, we create our rows all at once.

{% highlight swift %}
recipeTableView.setNumberOfRows(recipes.count, withRowType: "RecipeRowType")

for (index, recipe) in recipes.enumerated() {
  let controller = recipeTableView.rowController(at: index) as! RecipeRowController

  if let recipeName = recipe["name"] as? String {
    controller.titleLabel.setText(recipeName)
  }
}
{% endhighlight %}

A little different from the conventional cellForRowAtIndexPath jazz, but once you get head around that, you can enjoy your watch table view populated with our app’s snack list!

#### Deleting snacks



In the next blog post, I'll explore how to delete rows from both the iOS app and watch, and of course synchronize those changes.

—

In the next post, I’d like to be able to update my managed objects not just from the app, but from the watch kit extension too. To be clear, I am not attempting to synchronize two data models living in both the app and watch. I am simply passing fetched objects from the app to the watch, and making requests to read, update and delete managed objects from the watch to the app.

**I know you can have a data model in the watchOS, but I feel weird about that. In the future, I'm going to test how well persisted managed objects fare in a standalone content on the watch.!**
