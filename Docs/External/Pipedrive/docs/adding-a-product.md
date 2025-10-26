# Documentation

[← Back to tutorials](/tutorials)

## Adding a Product

## 1\. Introduction

This tutorial will focus on the Products feature in Pipedrive. If you want to see the finished code, you can find it [below](adding-a-product.md#full-working-example) in PHP and Node.js.

You can also try out adding a Product by using the [`POST /products`](https://developers.pipedrive.com/docs/api/v1/Products#addProduct) endpoint from our API Reference.

💡 Before you're able to properly start following along with this tutorial, you will need to have the products feature enabled in Pipedrive under _Settings > Tools and integrations > Products_.

## 2\. Prepare the data

When adding a product, there's only one required parameter you have to give a value to - the product name. You can give the new product [additional parameters](https://developers.pipedrive.com/docs/api/v1/Products#addProduct) as well. To send one or multiple parameters with your chosen values, you need to create an array of these chosen parameters. Note that for sending the prices of a product, you need to give value to `prices` in the form of an array of objects, for that see [how the body of the request looks like using JSON](adding-a-product.md#full-example-using-json).
    
    
    // Name of the product
    $data = array(
        'name' => 'Unicorn tear'
    );

## 3\. Define target URL

To make a request, you'll need the correct URL meant for adding products. All available endpoints and their URLs are described in our [API Reference](https://developers.pipedrive.com/docs/api/v1/#/). You must provide the API token as part of the query string for all requests at the end of the URL, an example would look like this `https://{COMPANYDOMAIN}.pipedrive.com/api/v2/products?api_token=.`

You need to create a `$url` variable which holds the correct URL for adding a product:
    
    
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v2/products?api_token=' . $api_token;

## 4\. Make a POST request

This part of the code is more complex and you don't need to understand it right away, all you need to know is that it contains everything to make a `POST` request with your data against our API. Simply copy and paste this:
    
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
     
    echo 'Sending request...' . PHP_EOL;
     
    $output = curl_exec($ch);
    curl_close($ch);

## 5\. Check the result

`$output` variable holds the full response you get back from the server. As all responses from us are in JSON format, the first thing you'll want to do is to convert it into a proper PHP array:
    
    
    // Create an array from the data that is sent back from the API
    // As the original content from server is in JSON format, you need to convert it to PHP array
    $result = json_decode($output, true);

Then you can check if data returned in the result is not empty:
    
    
    // Check if the data returned in the result is not empty
    if (empty($result['data'])) {
        exit('Adding failed' . PHP_EOL);
    }
    

And now you should check if product ID came back as returned data. If it did, then this means that the product was added successfully.
    
    
    // Check if the data returned in the result is not empty
    if (empty($result['data'])) {
        exit('Adding failed' . PHP_EOL);
    }
    

You can also check the changes in Pipedrive from the products section.

## 6\. Full working example (PHP)

Copy the full working example into `addProduct.php`. Don't forget to replace variables with your actual data:
    
    
    <?php
    // Content of addProduct.php
     
    // Pipedrive API token
    $api_token = 'YOUR_API_TOKEN';
    // Pipedrive company domain
    $company_domain = 'YOUR_COMPANY_DOMAIN';
     
    // Name of the product
    $data = array(
        'name' => 'Unicorn tear'
    );
     
    // URL for adding a product
    $url = 'https://' . $company_domain . '.pipedrive.com/api/v2/products?api_token=' . $api_token;
     
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
     
    echo 'Sending request...' . PHP_EOL;
     
    $output = curl_exec($ch);
    curl_close($ch);
     
    // Create an array from the data that is sent back from the API
    // As the original content from server is in JSON format, you need to convert it to PHP array
    $result = json_decode($output, true);
     
    // Check if the data returned in the result is not empty
    if (empty($result['data'])) {
        exit('Adding failed' . PHP_EOL);
    }
    // Check if an ID came back, if it did, print out success message
    if (!empty($result['data']['id'])) {
        echo 'Product was added successfully!' . PHP_EOL;
    }

## 7\. Full working example (Node.js)

Here's the Node.JS snippet
    
    
    // All tutorial Node.js code examples are for reference only and shouldn't be used in production code as is.
    import { Configuration, ProductsApi } from 'pipedrive/v2';
    
    // Configure authorization by setting api key
    // PIPEDRIVE_API_KEY is an environment variable that holds the real api key
    const token = process.env.PIPEDRIVE_API_KEY;
    
    // In production, a new Configuration instance should be initialised separately for each request.
    const apiConfig = new Configuration({ apiKey: token });
    
    async function addProduct() {
      try {
        console.log('Sending request...');
    
        const productsApi = new ProductsApi(apiConfig);
    
        // Required field: name
        const data = {
          name: 'et dolor in nulla',
          code: 'irure',
          unit: 'nulla',
          tax: 0,
          active_flag: 1,
          selectable: 1,
          visible_to: 1,
        };
    
        const response = await productsApi.addProduct({
          AddProductRequest: data,
        });
    
        console.log('Product was added successfully!', response);
      } catch (err) {
        const errorToLog = err.context?.body || err;
    
        console.log('Adding failed', errorToLog);
      }
    }
    
    addProduct();

## 8\. Full example using JSON

You can also use this JSON body example to add a product. For this request, the `content_type` needs to be `application/json`. Don't forget to [authenticate](core-api-concepts-authentication.md) your request.
    
    
    {
        "name": "",
        "code": "",
        "unit": "",
        "tax": "",
        "active_flag": "",
        "visible_to": "",
        "owner_id": "",
        "prices":[
            {
            "price": "", 
            "currency": "",
            "cost": "",
            "overhead_cost": ""
            }
        ]
    }

## 9\. Execute the code

Use `php addProduct.php` command to execute the code in the command line. Here's an example output if the product was added:
    
    
    Sending request...
    Product added successfully!
    

If adding the product failed, this is the output you'll get:
    
    
    Sending request...
    Adding failed
    

**🔗 For more adventures:**

Make sure to check the following resources:

  * **(API Reference)**[Products](https://developers.pipedrive.com/docs/api/v1/Products)
  * **(Sample Apps)**[Pipedrive Example Apps](https://github.com/pipedrive/example-apps)



Next 
