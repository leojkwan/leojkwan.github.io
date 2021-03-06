---
layout: post
title: 'Easy Networking and Testing with Moya'
type: post
status: published
comments: true
categories:
tags:
- ios
- swift 3
- networking
---

One of the things I've done most in iOS programming is create ad hoc networking layers that encapsulate NSURLSession. When I integrate any 3rd party service with a RESTful interface , I'll often create an APIManager/APIService of some sort which houses my URLSession, along with the handful of finely named methods my app would do with the service. 

<!--more-->

{% highlight swift %}
    struct InstaFoodAPIService {

        private let requestManager = RequestManager()

        func createUser(firstName: String, lastName: String, completion: (_ success: Bool)-> Void) {
            // requestManager.POST...
            // Handle returned data here
        }

        func fetchUser(firstName: String, completion: (_ user: User?)-> Void) {
            // requestManager.GET...
            // Handle returned data here
        }
        func fetchAllFriends(for user:User, completion: (_ users: [User])->()) {
            // requestManager.GET...
            // Handle returned data here
        }
    } 
{% endhighlight %}

It's actually not bad code. You are encapsulating concerns when you seperate your api service business logic from a request manager, which houses your either your own custom network client, or a popular library such AlamoFire or AFNetworking. 

Here's a real world example of a request manager I've used before (Full code example at the end)

{% highlight swift %}

public typealias RequestResponse = (_ statusCode:Int, _ data:AnyObject?) -> Void

struct RequestManager {
    
    static func makeHTTPSRequest(
        _ token: String?,
        postBody: AnyObject? = nil,
        methodString:String,
        urlString:String,
        completion: @escaping (RequestResponse)) throws {
            
            // URLSession setup code
            // ...

        // Create a data task object
        let task = session.dataTask(with: (request as URLRequest), completionHandler: {(data, response, error) in 
            // Parse Data
            if let data = data {
                
                if let dataDict = try? JSONSerialization.jsonObject(with: data, options: [.allowFragments]) {
                    completion(response.statusCode, dataDict as AnyObject?)
                } else {
                    completion(response.statusCode, data as AnyObject?)
                }
            } else {
                // Successful request- no data, send status code
                completion(response.statusCode, nil)
            }
        })
    })

{% endhighlight %}


This network client does one thing which is make a network request. The setup is straightforward since we're encapsulating over a vanilla shared URLSession. The static method takes in an optional access token for user protected requests, as well as a 'postBody' object, for POST requests.

As time goes on, I'll inevitably have to do more customized things with my request manager. For example, I may need to make a download task for larger sized files like images and video. Or, I may need to post a form and encode my post body with a form-encoded url. A ton of ifs and maybe's can happen, which is why libraries such as AlamoFire and AFNetworking are useful since just about any network request you'll have to make is wrapped in one place — not to mention it's powered by the culture of open-source, where tons of contributers maintain it, and even more companies/apps use it in production!

But that's the networking layer. You still have to encapsulate your seperate service layers however you do it in your application. Maybe you've awesome and you build a generic request manager for your twitter, github, facebook RESTful interfaces... or maybe you're like me and decide to look past the duplication and make a small, teensy manager just for mailchimp. Just a small class that does one thing. I mean, it could just live on it's own right?
#### No.
You're going to look back at your code months from now with 4-5 different "little" network layers and wonder, "where is that code that makes the request to fetch my email lists again?" 

---

### Enter Moya. 
An abstraction layer over the popular AlamoFire with the goal that it's your one and *only* abstraction layer. It means you're going to have to buy in to the library, but If popularity and open-source maintainability is your concern, <a href="https://github.com/Moya/Moya">look again</a>.


I haven't used Moya in any Production application but here are a few reasons why I like the look of it.

1. #### All relevant service logic is encapulated in one place
    
    In Moya, your 3rd party service endpoints are seperately defined as enums with its listed endpoints as your enum cases. The one similarity your enums must enforce is the 'TargetType' Protocol. If you're not well in tuned with protocols in Swift, check out my post on <a href="http://leojkwan.com/2015/09/design-patterns-delegation-in-swift">delegation and protocols.</a>

    Like I mentioned earlier about our first request manager, you still have to separate each of your services, indicating it's base url, params, header and encoding logic somewhere. While it's not terribly hard to stay organized and seperate your different services, it is two times as simple to be lazy and sprinkle networking code all across your app. That said, you eventually *will* get lost 2-3 months from now. 
    
    The great thing about working with Moya is that in order to even get the library up and running, you're enforced to be structured and separate targets from the start! Double win.
    
    It's best understood when examining the 'TargetType protocol'.

    ---
    Here's an example of what your 'TargetType' enum requires when declaring a service(API you are making requests against; facebook, mailchimp, stripe) in Moya. (Adapted and slightly modified from Moya's setup instructions)

    {% highlight swift %}

        extension InstaFoodService: TargetType {
        
        var baseURL: URL {
            return URL(string: "https://api.instafood.com")!
        }
        
        var path: String {
            switch self {
            case .createUser(_, _):
            return "/user"
            }
        }
        
        var method: Moya.Method {
            switch self {
            case .createUser:
            return .get
            }
        }
        
        var task: Task {
            switch self {
            case .createUser:
            return .request
            }
        }
        
        var parameters: [String: Any]? {
            switch self {
            case .createUser(let firstName, let lastName):
            return ["first_name": firstName, "last_name": lastName]
            }
        }
        
        var parameterEncoding: ParameterEncoding {
            switch self {
            case .createUser:
            // Send parameters as JSON in request body
            return JSONEncoding.default
            }
        }
        
        var sampleData: Data {
            switch self {
            case .createUser(let firstName, let lastName):
            let userJson = [
                "firstName": firstName,
                "lastName": lastName
            ]
            return jsonSerializedUTF8(json: userJson)
            }
        }
        
        // Helper
        private func jsonSerializedUTF8(json: [String: Any]) -> Data {
            return try! JSONSerialization.data(
                withJSONObject: json,
                 options: [.prettyPrinted]
                 )
            }
        }

{% endhighlight %}




2. ####  It's designed to enforce endpoint testability. 
    Like I said, the crux of Moya lies in this the 'TargetType' protocol. But one requirement that really stuck out to me was the required 'sampleData' variable. Initially I thought this would be an optional objective-c protocol, but no — you need to define what data you expect to be returned from each of our endpoints. I don't always unit test my code, but anyone buying into Moya will have a much easier time testing his/her endpoints, since you'll have already established your stubbed data. My one concern is that this requirement brings up the debate at to whether or not you should <a href="https://8thlight.com/blog/eric-smith/2011/10/27/thats-not-yours.html">mock types you don't own.</a>

3. #### It leverages XCode's compile time checking for any request you're intending to make.

    Because your services are represented as enums, your url params can be represented in the shape of an Enum's associated values, making it 4.5 times (this may vary :O) harder to make screw up a network request. For example, when interacting with the example InstaFood service above, the 'createUser' POST endpoint required 'firstName' and 'lastName' in the post body. 

    {% highlight swift %}

        extension InstaFoodService: TargetType {
        // ...

        var parameters: [String: Any]? {
            switch self {
                case .createUser(let firstName, let lastName):
                return ["first_name": firstName, "last_name": lastName]
            }
        }

        // ...
        }
    {% endhighlight %}

In the parameters field of my InstaFood service type, I can layout how the post body should look like by passing the associated values I receive from the '.createUser' case into a firstName, lastName dictionary. Power of enums!


---

### Making the request with MoyaProvider

Remember the 'RequestManager' from above. **'MoyaProvider' is now your request manager.** It requires a <a href="http://leojkwan.com//2016/04/generics-hashable-1"> generic type</a> on creation, and that's right— you guessed it, the generic type must conform to the 'TargetType' protocol. How convenient! Our InstaFoodService enum fits right into that requirement, so when we do need to pull from the InstaFood API, it would look something like this.


{% highlight swift %}

struct User {
    let firstName: String
    let lastName: String
}

class ViewController: UIViewController {
  
  private let instaFoodService = MoyaProvider<InstaFoodService>()

  override func viewDidLoad() {
    super.viewDidLoad()

    let newUser = User(firstName: "Leo", lastName: "Kwan")    
    
    instaFoodService.request(.createUser(
        firstName: newUser.firstName,
        lastName: newUser.lastName
        )
    ) { (result) in // Result<Moya.Response, MoyaError>
      
      switch result {
        
      case .success(let response):

        // a 200 because requests are too easy now.
        let statusCode = response.statusCode

        // Do something after we create a new user

      case .failure(let error): break
        
        // Could not make a network request
        // Maybe we should try again when there is internet?
        print(error)
      }
    }
    
  }
}

{% endhighlight %}

What you're left with is a straightforward request with compile time checking. In this example, I get my associated type autocompletes ('(firstName: #String#, lastName: #String#)) when typing '.createUser...', so I know exactly what this path needs to make the right request. While that's a bonus win with Moya, the biggest win for me is, again, the one request interface in 'MoyaProvider'.

It takes a generic TargetType, which means no more ad hoc api managers. If I want to make a facebook request, all I need to do is declare another 'TargetType' conforming enum.

{% highlight swift %}

    let facebookProvider = MoyaProvider<Facebook>()
    
    facebookProvider.request(
        .fetchAllFriends(
            facebookId: _String_,
            token: _String_
        )
    ) { (response) in
        // Similar code to handle data/error goes here
        // It's that easy.
    }

{% endhighlight %}

**...Or** Vimeo, or Github, or Stripe, or Mixpanel, or Strava, or really any REST interface with 'MoyaProvider'.

---

Granted, there's no rocket science going on over here. At the end of the day, Moya is just a great networking abstraction actively maintained by many contributers who Moya in production level applications. For those of you who feel that you've already solved your networking challenges and are rolling your own better + generic (in a good way) networking layer, kudos to you. 

But for those of you like me who'd rather not take on the intellectual challenge to whip up an amazingly flexible and extensible(check the RxSwift Moya extensions) networking library leveraging AlamoFire, using a framework like Moya can greatly free up your mental overhead when programming for iOS because you know more definitively where your network logic lives for each one of your targets.

---

<br>
<br>

##### *Making request with Moya*
{% gist leojkwan/ebd3f3e13ac5af456ee42ad817ab1820 %}

##### *Making request with RequestManager wrapping URLSession.shared*
{% gist leojkwan/bbdd49e51a8fb8bed6a9d4d927016826 %}
