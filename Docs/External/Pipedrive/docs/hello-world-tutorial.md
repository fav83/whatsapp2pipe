# Documentation

[← Back to tutorials](/tutorials)

## Build your first Pipedrive App 🚀

## 1\. Introduction and prerequisites

Before we venture on a journey to build our first Pipedrive App, make sure you have [a sandbox account](https://developers.pipedrive.com) (more info about it [here](developer-sandbox-account.md)). We are also using Glitch to run the app so make sure you have an account and are [logged in to it](https://glitch.com/signin).

Glitch is a powerful tool for collaborating and building apps. This also means that you can build your app without having to do any local setup for testing.

Curious? Let's get started.

💡 When you request a Developer sandbox account, make sure you select the option "I'm building an app that integrates with Pipedrive" as this option gives you access to the Developer Hub.

## 2\. Starting from the boilerplate

Click the [Remix](https://glitch.com/edit/#!/remix/pipedrive-hello-world) button below to instantly generate a sample app boilerplate. You should see a new Glitch project opening up.

[Remix app in Glitch](https://glitch.com/edit/#!/remix/pipedrive-hello-world)

If everything goes fine, you would see the README instructions, similar to the screenshot below. You can confirm if the app is running or not by clicking on the 📝 Logs section in the footer.

![](/tutorials/_next/static/media/bf87569b4ede9f85.d0f20351.png)

## 3\. Let's Code (A Bit)

Now that we have a boilerplate app ready, let's add some code. Click on the index.js file in the project sidebar of your Glitch App.

![](/tutorials/_next/static/media/c0e0ee54e6d1bc7f.0a7a61a4.gif)

Copy and paste the following code in the intended area (Line 47).
    
    
    app.get('/auth/pipedrive', passport.authenticate('pipedrive'));
    app.get('/auth/pipedrive/callback', passport.authenticate('pipedrive', {
        session: false,
        failureRedirect: '/',
        successRedirect: '/'
    }));
    app.get('/', async (req, res) => {
        if (req.user.length < 1) {
            return res.redirect('/auth/pipedrive');
        }
    
        try {
            const deals = await api.getDeals(req.user[0].access_token);
    
            res.render('deals', {
                name: req.user[0].username,
                deals: deals.data
            });
        } catch (error) {
            return res.send(error.message);
        }
    });
    app.get('/deals/:id', async (req, res) => {
        const randomBoolean = Math.random() >= 0.5;
        const outcome = randomBoolean === true ? 'won' : 'lost';
    
        try {
            await api.updateDeal(req.params.id, outcome, req.user[0].access_token);
    
            res.render('outcome', { outcome });
        } catch (error) {
            return res.send(error.message);
        }
    });

By doing so, we have defined the endpoints & logic required for deal retrieval & handling [the OAuth 2.0 flow](marketplace-oauth-api.md). You would also notice that our callback URL path is /auth/pipedrive/callback. Take note of it. It will be handy soon.

## 4\. Creating an app via Developer Hub

Apps extend the functionality of Pipedrive. They use OAuth 2.0 for authorization which lets you access data and perform operations through the Pipedrive RESTful API.

You can create a Pipedrive OAuth App from the Developer Hub. You can access the Developer Hub via the following steps:

Clicking on Profile icon in the top right corner > Tools and Integrations > Developer Hub from the Tools section.

Follow the instructions below to create an app. _Do not hit ‘Save' yet._ We still need to include a few details.

💡 If you are building a public app that will be available in the Pipedrive Marketplace, select Yes in the Intent to Publish in the Pipedrive Marketplace dialog that appears right after clicking on Create New App button.

If you are just creating a test app, select No. Red Pill/ Blue Pill, you get to make the choice.

![](/tutorials/_next/static/media/1202e7452bb89ad0.e374f9fb.gif)

## 5\. Specifying the callback URL, scopes & client details

For a test app, all you need to provide is the Name and callback URL. Here's how you can figure out the callback URL for the Glitch App:

Just click on the Share button in the top right corner of the Glitch App and copy the Live Site URL. Jogging our memory, we know that the callback URL path is /auth/pipedrive/callback.

So the entire callback URL will be a combination of the Live site URL and the path and should look like this.

https://<glitch_appname>.glitch.me/auth/pipedrive/callback

![](/tutorials/_next/static/media/c9f3bd7fb5fb20dd.b4795c26.gif)

💡 If you haven't signed up with Gitch, you can also find the Live URL from the Logs section in the footer

Let's go back to the Create New App screen in Developer Hub and provide the necessary information.

  1. In Developer Hub, add the name of your app.
  2. Scroll down to the "OAuth & Access scopes" section and insert the entire callback URL from above in the "Callback URL" field.
  3. Select "Deals" and "full access" in the "Access scopes" section.
  4. Scroll back up to the top and click ‘Save' after you've filled in all of this.



You can see from the image below how we have provided the name, callback URL, and the scopes that are required for the app.

🚧 Make sure you specify the right scopes while creating an app. In our case, the sample app is expected to read and modify deals. Hence we select Deals - Full Access in the scopes section.

For more information on scopes, check out [the Scopes and Permissions](marketplace-scopes-and-permissions-explanations.md) explained.

Once you have successfully created the app, it would generate a Client ID and Client Secret that you need to copy and paste in the .env file of our Glitch app. These values are loaded as environment variables which are in turn substituted in the config.js file. You can find this information by clicking on the app (via Developer Hub) and navigating to the OAuth & Access Scopes section.

![](/tutorials/_next/static/media/d85d3ee0669ec96a.c513ad4f.png)

Copy the relevant details and add them to the .env file. Make use of the _Graphical Editor_ option to conveniently add these values in Glitch.

![](/tutorials/_next/static/media/5dd1cc6047242b8e.da568445.png)

✅ Storing secrets in a .env file is way more secure compared to storing the same in the source code.

🚨 Do not expose or share the clientSecret value. Avoid sharing confidential information such as tokens, secrets, and keys to stay clear of exploits.

## 6\. Running the app 🚩

Now that we have coded and created a new app in our Pipedrive account, it's time for a test drive 🚙..

All you need to do is access the live URL from the browser (https://<glitch_appname>.glitch.me).

  * The OAuth flow will be initiated, and the user will be requested to grant authorization.
  * Upon authorization, our app gets the access_token and uses it to retrieve the list of deals.
  * Make sure you have some test deals in your account; otherwise, the list might be empty.
  * Clicking on a deal randomly marks it as Won / Lost. You can notice the change in the Deals section of your account.



![](/tutorials/_next/static/media/ddfc0a5449fe0c2f.ce404f73.gif)

There you go, congratulations! Your first app is live and ready. Feel free to tweak and play around with it. You can replicate the setup locally by[ cloning the sample app](https://github.com/pipedrive/FiftyFifty) and running it as a Node.js app.

![](/tutorials/_next/static/media/916e5e75ecba1532.166e87be.png)

## 7\. Troubleshooting 🛠

Clicking on the Logs section in the footer will indicate the status of your app. You would notice an error message if something goes wrong and can always course-correct based on that.

You could always reset the app's authorization. To do so, follow these steps:

  1. Click on the Terminal button at the footer of the Glitch App and type "refresh". This would restart the Glitch App.



![](/tutorials/_next/static/media/e322f8d955b88ae.f18cc035.png)

  2. You can also uninstall the app to revoke authorization.



![](/tutorials/_next/static/media/a127708a5b7b4f5f.7ee6e068.png)

If you access the Live URL again, it will initiate the OAuth flow again. Feel free to create a topic in [the Developer Community](https://devcommunity.pipedrive.com/) if you face any challenges during your app development journey. ❤️

Next 
