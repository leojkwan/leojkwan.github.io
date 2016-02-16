---
layout: post
title: "Incorporating Youtube's Data API in your Xcode project."
date: 2015-07-23 14:21:52.000000000 -04:00
type: post
published: true
status: publish
tags:
- ios

---

If you ever wanted to integrate youtube search and play capabilities into your iPhone app, you will eventually need to play around with Youtube’s Data API.

Depending on the level of interaction you would like to have with a user, you may need to authorize requests with OAuth 2.0. But if you are just interested in searching and playing videos based on a particular query like this post, all you need to do is sign up for an API key on Google’s dev console. With just the free rate limit, you are allowed 5,000,00 requests per day, but as you will soon realize, those API calls can accrue pretty fast with even the most basic requests.

<!--more-->

###Go to Youtube’s Developer Console and request an API Key.

![](https://s3-us-west-2.amazonaws.com/leojkwan/images/youtube-screenshot1.png)
{: class="subtitle-text" }

![](https://s3-us-west-2.amazonaws.com/leojkwan/images/youtube-screenshot2.png)
{: class="subtitle-text" }

With just the free quota, you get 50 million units/day and 3000 requests/second/user.

---

### Create a new project in Xcode with a single view application.

##### Pod Install the <a href="https://github.com/AFNetworking/AFNetworking">AFNetworking</a> CocoaPod.

![](https://s3-us-west-2.amazonaws.com/leojkwan/images/afnetworkingScreenshot.png)
{: style="max-width:200px;"}

I used AFNetworking to perform my HTTP requests for youtube’s JSON responses. Just about every app you see in the App store that connects to the internet utilizes this powerful cocoa pod that allow you to make HTTP requests in Objective C. It’s a great alternative to using NSURL Session, which is a slightly more tedious method to speak with the internet.<br />

#### Create an APIClient class.
This client class will have two class methods, one for performing a youtube search, and the other for retrieving a video’s statistics (we’ll be getting total view count info in this demo.) I also like to compartmentalize my class objects because it’s cleaner to read and operate with in the long run of a project. I will also create an API Key class that stores my API keys. That way, if I push my projects to the app store or leave it open source on Github, I can hide my private information from public eye with gitignore, a method in Git that excludes files that you prefer to have untracked.Bad things can happen with an exposed API key.

---

### 1st GET request to Youtube API.
{: class="subtitle-text"}

In our first GET request, all we want to do is get back the results in a video search query. The base URL for this standard call is:
https://www.googleapis.com/youtube/v3/search

All of the logic will take place in a GET request method. You will need to pass in the query for what you want to search, as will as a completion block that will accept what you get back from Youtube.
This is an example class method I used for the GET Request:

```objective-c
+(void) getVideosWithQuery:(NSString *)query completionBlock:(void (^) (NSDictionary *)) completionBlock;
```
<!--`*-->

#### To search Youtube with a specific query, you need several params:
1. part: snippet
2. q: query
3. API Key

Within this method, create a dictionary for all the parameters you want to pass in. I my example dictionary, I have 4 keys: “part”, “q”, “order” and “key”. The additional order key is that my video query response will be ordered from highest to lowest view count.

The “part” key is technically the only required param for making an API call to Youtube, but since we registered an API Key, we should pass in "key" as well to guarantee our daily free rate of 5 million requests per day. Of course, the value for this key will be your API Key in string format: like so: @“key”: @“ThisIsMyAPIKeyICopiedAndPastedFromYoutube”.

Here is the method call in full:

{% gist leojkwan/9615ed1cb2746f35245b %}

---

<h3></h3>
<h3 style="text-align:center;"><strong>Your 2nd GET request.</strong></h3>
<p>Currently, youtube’s Data API is in it’s third version. In the past, one API call would swoop up most of a video searches data and we would be done with it. In V3, you need to make another GET request to get the statistical information for a specific video such as view count. Seriously? Here’s the layout for API call points for Youtube</p>

![](https://s3-us-west-2.amazonaws.com/leojkwan/images/youtube-screenshot3.png)
{: class="subtitle-text" }


<p>If you add it all up, the total amount of requests for one action is tremendous. The first API response with a “snippet” request will cost 2 quota points, but for every video within that search query, I will need to spend an additional 2 points to access its statistical information like view count.</p>

#### This is how what the second API request method would look like with AFNetworking.
{% highlight objc %}
+(void) getVideosStatsWithVideoID:(NSString *)videoID completionBlock:(void (^) (NSDictionary *)) completionBlock;
{% endhighlight %}

#### Notice the difference with the base URLs.

{% highlight objc %}
NSString *const YOUTUBE_SEARCH_URL = @"https://www.googleapis.com/youtube/v3/search";
NSString *const YOUTUBE_STATS_URL = @"https://www.googleapis.com/youtube/v3/videos";
{% endhighlight %}


In the second API call, you need to pass in the specific videoId that you get back in your first GET request and pass it into this second GET request.

---


The first JSON Response.
{: class="title-text"}

Pass your response object into a completion block. If you get a successful request, you will get back a dictionary with a list of items and their snippet details like video name, channel name etc. Depending on what you need and the specific filters you would like in your search query, you can add and modify your params dictionary to suit your needs. Refer to <a href="https://developers.google.com/youtube/v3/docs/search/list" target="_blank">youtube's docs</a> for more info.


<p>Drag in a table view controller into your storyboard. Lets just make sure our API class methods are all set up right and that we are getting back a successful JSON response from youtube. Create a class for your table view controller and import your Youtube API Client into the TVC implementation file.</p>
In your viewDidLoad, call your getVideosWithQuery method:

{% highlight objc %}
[YouTubeAPIClient getVideosWithQuery:@"Flatiron School" completionBlock:^(NSDictionary *response) {
  NSLog(@"%@",response);
}];
{% endhighlight %}

We just want to log the response we get. I passed in “Flatiron School” in my query, and I got back a JSON response like this:

{% highlight objc %}
items = (
{
etag = "\"iDqJ1j7zKs4x3o3ZsFlBOwgWAHU/3AMBW9rCtJUATL28IiCJO4NlsWk\"";
id = {
kind = "youtube#video";
videoId = "v3w9BODR-Yg";
};
kind = "youtube#searchResult";
snippet = {
channelId = UCedo9harMOgixvNhNB0sEyA;
channelTitle = FlatironSchoolNY;
description = "Visit http://flatironschool.com/kodewithkarlie to learn more! Karlie, model and co-founder of Karlie's Kookies, started learning to code at Flatiron School in 2014.";
liveBroadcastContent = none;
publishedAt = "2015-04-08T14:29:52.000Z";
thumbnails = {
default = {
url = "https://i.ytimg.com/vi/v3w9BODR-Yg/default.jpg";
};
high = {
url = "https://i.ytimg.com/vi/v3w9BODR-Yg/hqdefault.jpg";
};
medium = {
url = "https://i.ytimg.com/vi/v3w9BODR-Yg/mqdefault.jpg";
};
};
title = "#KodeWithKarlie";
};
{% endhighlight %}

<p>So we’re getting a ton of valuable information in what is considered a “snippet” for Youtube. Notice you get back a video’s URL identifier, the image thumbnail URL, the video title, and the channel name that posted the video. That’s awesome, but all of there details are buried in one big JSON response, or what I see as an array of dictionaries within dictionaries within dictionaries. This calls for some JSON spelunking. We need to somehow take the endpoints we need and bundle it all up—</p>

##### Let’s make a separate youtube video class.

In this class, the video will have several properties, specifically the properties we want displayed in our table view controller.<br />
It should look something like this in your header file:

{% highlight objc %}
@property (nonatomic, strong) NSString *titleOfVideo;
@property (nonatomic, strong) NSString *titleOfChannel;
@property (nonatomic, strong) NSString *videoID;
@property (nonatomic, strong) NSString *totalViews;
@property (nonatomic, strong) NSString *thumbnailURL;
{% endhighlight %}

We will also need a class method that instantiates a Youtube Video object with the values we get back from youtube plugged into the object’s properties. That would look something like this in the implementation file:

```objective-c

+(YoutubeVideo *) videoFromDictionary:(NSDictionary *) videoDictionary {

YoutubeVideo *video = [[YoutubeVideo alloc] init];

video.titleOfVideo = videoDictionary[@"snippet"][@"title"];
video.titleOfChannel = videoDictionary[@"snippet"][@"channelTitle"];
video.videoID = videoDictionary[@"id"][@"videoId"];
video.totalViews = videoDictionary[@"snippet"][@""];
video.thumbnailURL = videoDictionary[@"snippet"][@"thumbnails"][@"high"][@"url"];

return video;
}
```


<h5><strong>Make an NSMutable Array in your table view controller to capture our video results.</strong></h5>

<p>So we created a separate youtube video class. We need to create a for loop within our GET request’s completion block, where we previously NSLogged our JSON response, to capture and and instantiate youtube video objects based on what we get back from youtube. If you took a close look at what your console logged for the response object from youtube, you will notice that we get back <strong>one</strong> big dictionary with <strong>one</strong> big array, with <strong>many</strong> dictionaries within it. Each of those dictionaries encapsulate one video result from youtube.</p>


Because they are in an array, we can loop through them and pick out what we need to create a youtube video object. Lets make an NSMutableArray outside our method call. Afterwards, call your YoutubeAPIClient class method and plug the response values into a video instance within a for loop.
<!--`*-->

```objective-c
[YouTubeAPIClient getVideosWithQuery:@"Flatiron School"
 completionBlock:^(NSDictionary *response) {
for (NSDictionary *video in response[@"items"]) {
 YoutubeVideo *videoAtThisIndex = [YoutubeVideo videoFromDictionary:video]; 
[self.FISVideoResultsArray addObject:videoAtThisIndex];
}
```

<!--`*-->

---

### In your cellForRowAtIndexPath, you will need to do <strong>three</strong> things.

1. Instantiate your custom table view cell with a reuse ID name. Make sure you also set it in your storyboard.
2. Make instances of your youtube video object and set the videos to the items in your mutable array at their indexPath.row count.
3. Set the UILabels of your custom class to the properties you created for your Youtube object

```objective-c
YoutubeTableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"youtubeReuseCell" forIndexPath:indexPath];

//ensures each cell in your table view corresponds to the exact
// order that mutable array model displays.

YoutubeVideo *videoAtThisRow = self.FISVideoResultsArray[indexPath.row];

cell.videoTitleLabel.text = videoAtThisRow.titleOfVideo;
cell.channelNameLabel.text = videoAtThisRow.titleOfChannel;
```

![](https://s3-us-west-2.amazonaws.com/leojkwan/images/youtube-screenshot5.png)
{: class="subtitle-text" }

<p>It’s a bit tricky with the thumbnail URL property because assuming you set a UIImageView in your custom table view cell, you will need to create a NSData instance with the imageURL, and then you’ll have to create a UIImage with that NSData. With the UIImage, now you can set the image to the cell property.</p>

```objective-c
for(ATRYoutubeVideo *videoAtThisIndex in self.videoResultsWithQuery) {

[ATRYouTubeAPIClient getVideosStatsWithVideoID:videoAtThisIndex.videoID completionBlock:^(NSDictionary *response) {
NSLog(@"%@", response);

NSString *viewCountForThisVideo = response[@"items"][0][@"statistics"][@"viewCount"]; // The array we want will always be 0 because the completion block will always return just one

videoAtThisIndex.totalViews = viewCountForThisVideo;
```


Before we end leave this second completion block (which is in our first class method’s completion block), we need to reload our table view data on the main thread, ensuring that the table view will reload once the API response is finished. Otherwise, our table view will load in the storyboard before our API GET request is finished.

<h5>Add this into the end of your second class method’s completion block:</h5>

```objective-c
[[NSOperationQueue mainQueue] addOperationWithBlock:^{</pre>

[self.youtubeResultsTableView reloadData];
}];
```

#### Assuming you passed in the Flatiron School like I did into your search query, you should get back something like this in your tableview controller.
<br>
<video controls height="500px" width="100%"
  src="https://s3-us-west-2.amazonaws.com/leojkwan/images/youtubeapi.mov">
</video>
