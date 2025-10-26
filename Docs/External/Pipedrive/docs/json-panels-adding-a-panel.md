# Adding a JSON panel

[ __Suggest Edits](/edit/json-panels-adding-a-panel)

## 

Terminology

[](#terminology)

* * *

**JSON panels** – An entrance point for an app’s data and interactivity inside Pipedrive in a panel format

**Object** – JSON panel object is a data entry point with multiple descriptive fields displayed inside a panel. A panel can contain multiple objects.

**Field** – Descriptive data field in a particular format within the object

**Global actions** – A green action button at the bottom of the JSON panel. It features one main [app action](/docs/app-extensions-actions) and a dropdown menu if there are multiple app actions and/or an external link.

  


* * *

## 

How can I add a JSON panel in Developer Hub?

[](#how-can-i-add-a-json-panel-in-developer-hub)

* * *

You can add JSON panels to the Pipedrive UI either when [registering the app](/docs/marketplace-registering-the-app) or [updating the existing app](/docs/marketplace-updating-the-existing-app).

In [Developer Hub](https://app.pipedrive.com/developer-hub), click on your app’s name and go to the App extensions tab.

In the App extensions tab, click “Add JSON panel” in the JSON panel section to access the form. Fill in the JSON panel’s name and the rest of the relevant fields. Once you’re done, click “Save”.

Field| Description  
---|---  
Panel name (required)| The name of the JSON panel. Descriptive, max 30 characters.The name will appear in the Features section of your Marketplace app listing.  
Panel description| To showcase the interactive features of your app, your panel’s name and description will appear in the Features section of your Marketplace app listing.Use the description field to let users know what they can do within this panel.Optional; max 150 characters.  
API endpoint (required)| The URL of the endpoint which we'll use to fetch the data of the object properties  
HTTP Auth username and password (required)| Our service will send the HTTP request with these credentials as the basic authentication header to protect your data. To protect your data, we strongly recommend using authenticated HTTPS requests. Note that we do not support self-signed certificates.  
[JWT](https://jwt.io/) secret| JWT is required **if** HTTP Auth is not provided.  
JSON data structure (required)| A JSON file that describes the structure of your JSON panel seen in the Pipedrive UI  
Panel locations (one required)| Choose where the panel would be displayed: 

  * Deal details
  * Person details
  * Organization details

Each app can have one JSON or custom panel in each location.  
  
### 

JSON panel authentication

[](#json-panel-authentication)

Your JSON panel **has to be authenticated** in one of two ways: basic authentication or [JWT](https://jwt.io/). It is also possible to configure both basic authentication and JWT as well.

### 

Panel actions

[](#panel-actions)

Panel actions can be added in the same section of Developer Hub where you add your JSON panels: inside _Developer Hub > App extensions_.

Once you’ve added and saved your JSON panel, scroll down to the “My added extensions” section. You’ll find the JSON panel you’ve just added and a “+ Actions to this panel” button right below it. Find out how to add actions in panels [here](/docs/json-panels-actions-in-panels).

### 

JSON data structure

[](#json-data-structure)

To create the JSON panel displayed in Pipedrive’s UI, you need to add it as a JSON file to Developer Hub with a JSON schema defining the JSON panel’s structure. 

The JSON panel can have a maximum of **ten objects** which are titled by headers and contain a maximum of **twenty fields** (excluding the [header field](/docs/json-panels-adding-a-panel#header-field)), all of which should be defined in the JSON schema. You can also use the [single object JSON panel template](https://raw.githubusercontent.com/pipedrive/example-apps/master/json-samples/app-panel-single-object.json) or [multiple object JSON panel template](https://raw.githubusercontent.com/pipedrive/example-apps/master/json-samples/app-panel-multiple-object.json) for defining your JSON schema.

### 

Fields

[](#fields)

In the JSON Schema, you can specify the fields that your JSON panel will contain. These fields should be added to JSON Schema as properties. We support the following types of field definitions:

> ## 📘
> 
> Keep in mind that if the data received from your API endpoint does **not** match the required data types, the whole app panel's data will not be displayed and the user will see an error message stating **"Something went wrong…"**.

Object property| Object property type| Format requirements for the response| Examples and explanations  
---|---|---|---  
Text| `$ref: "#/definitions/text"`| `"markdown": true` needs to be added adding links with labels. More in [text in API response](/docs/json-panels-adding-a-panel#text-in-api-response).| Can contain links, emails, bold text, numbered lists and bulleted lists.  
Links can be displayed with labels by using markdown. See [text in API response](/docs/json-panels-adding-a-panel#text-in-api-response).  
Truncated after 255 characters.  
Numerical| `$ref: "#/definitions/numerical"`| | 12.00  
12,00  
Date| `$ref: "#/definitions/date"`| YYYY-MM-DD| 2018-11-23  
Time| `$ref: "#/definitions/time"`| hh:mm:ssZ| 20:20:39+02:00  
DateTime| `$ref: "#/definitions/date-time"`| YYYY-MM-DDThh:mm:ssZ| 2018-11-13T20:20:39+02:00  
Email| `$ref: "#/definitions/email"`| | [[email protected]](/cdn-cgi/l/email-protection#e3898c8b8d878c86a3848e828a8fcd808c8e)  
Link| `$ref: "#/definitions/link"`| See [how link should be defined in your API response](/docs/json-panels-adding-a-panel#link-in-api-response)| <https://www.pipedrive.com/>  
Phone number| `$ref: "#/definitions/phone"`| | +3725000001  
Address| `$ref: "#/definitions/address"`| | 460 Park Ave South, New York, NY 10016, USA  
Currency| `$ref: "#/definitions/currency"`| See [how currency should be defined in your API response](/docs/json-panels-adding-a-panel#currency-in-api-response)| USD 200,99  
Label| `$ref: "#/definitions/label"`| See [how label should be defined in your API response](/docs/json-panels-adding-a-panel#label-in-api-response).  
Available colors for the label:

  * Green (#08A742)
  * Red (#F94839)
  * Blue (#317AE2)
  * Yellow (#FFCC00)
  * Purple (#721EA9)
  * Grey (#B9BABB)

| Label's text is truncated after 40 characters  
Label's text should be in sentence case **e.g Potential client**  
Tags| `$ref:"#/definitions/tags"`| An array of strings representing tag labels need to be sent back in the API response. See more in [tags in API response](/docs/json-panels-adding-a-panel#tags-in-api-response).| One, Two, Three  
  
In our JSON Schema, the `additionalProperties` keyword is set to `false` by default, so you can only send values to defined properties. If you send data that isn’t defined properly under `properties`, the panel won’t be rendered correctly, and the user will see an error. For more information regarding how we’ll display the property’s data, see [understanding JSON Schema](https://json-schema.org/understanding-json-schema/reference/string.html) and [additional properties](https://json-schema.org/understanding-json-schema/reference/object.html#properties).

### 

The ordering of fields

[](#the-ordering-of-fields)

The set of properties will be rendered to the list of fields in the JSON panel according to how they are defined in the JSON Schema. The only exception is the `header` field, which will be excluded from the array and moved to the header of the app panel’s object. For example, if in `properties` the fields are defined in order of `id`, `header`, `name` and `email`, then the order visible in the UI’s app panel would start out with the app panel's object header and have name and email as fields.

### 

Text in API response

[](#text-in-api-response)

![1188](https://files.readme.io/7d18908-b7b9549-App_panels_-_text_in_API_response_-_Pipedrive_Developer_Documentation.png)

Visual of text object property

Response example of text with markdown support. Value object only supports adding labels to links in markdown in the format shown in the sample below:

JSON
    
    
    {
      "note": {
        "markdown": true,
        "value": "Meeting next week to sign the [insurance contract](pipedrive.com).\n\n&nbsp;\n\n **Agenda**\n1. Agree on contract details\n\n **Links**\n - [Insurance company](https://www.pipedrive.com/en/features)"
      }
    }
    

### 

Currency in API response

[](#currency-in-api-response)

![1202](https://files.readme.io/1bfd2cb-779d933-App_extensions_-_currency_in_API_response_-_Pipedrive.png)

Visual of currency object property

`currency` object property should be defined as an object in the API response and values for `code` and `value` properties should be given. `code` is the [ISO-4217](https://www.iso.org/iso-4217-currency-codes.html) format currency code for non-custom currencies (custom currencies cannot be added or removed via the API, only admin users of the account can [configure them from the Pipedrive web app](https://support.pipedrive.com/en/article/how-can-i-create-a-custom-currency)). Overall, `code` is matched to the codes defined in Pipedrive and if the currency is already defined with a symbol, the symbol is shown instead of the currency code in the app panel.

JSON
    
    
    "delivery_cost": {
        "code": "USD",
        "value": 2000.00
    }
    

### 

Label in API response

[](#label-in-api-response)

![1202](https://files.readme.io/1f8add7-c46df8c-App_extensions_-_label_in_API_response_-_Pipedrive.png)

Visual of label object property

`label` object property should be defined as an object in the API response and values for color and label properties should be given. `label`'s colors can be `green`, `red`, `blue`, `yellow`, `purple`, `grey`. Label's text of the `label` object property can be 40 characters long before truncated. 

JSON
    
    
    "label": {
        "color": "yellow",
        "label": "Assembling"
    }
    

### 

Link in API response

[](#link-in-api-response)

`link` property can be defined in two ways.

  1. A plain string with URL:



JSON
    
    
    "link": "https://www.pipedrive.com"
    

  2. An object with the following data:



Field| Description  
---|---  
`label` (optional)| The anchor text of the URL  
`value` (required)| The URL  
`external` (required)| A boolean value that defines whether the link will be opened in the same tab (`false`) or a new one (`true`)  
  
JSON
    
    
    "link": {
        "label": "Pipedrive",
        "value": "https://www.pipedrive.com",
        "external": false
    }
    

### 

Tags in API response

[](#tags-in-api-response)

![1202](https://files.readme.io/54afd76-4ad8067-App_extensions_-_tags_in_API_response_-_Pipedrive.png)

Visual of tags

Tag labels need to be sent in an array of strings format, where each string will represent one tag.  
Tags will be displayed in the app panel as separate unclickable labels. 

JSON
    
    
    "tags": ["Cruise control", "Rain detector", "Lane assist"]
    

### 

Header field

[](#header-field)

For single object panels, the `header` is a separate optional field that defines the header of the app panel, e.g. "GTA 22 Blue Auto".

For multiple object panels, the header `field` is required as it’s the title of each object within the panel, e.g. "GTA 22 Blue Auto", “BNW X500”, “Dorche 911”. You can define the `header` field the same way you have defined all other fields:

JSON
    
    
    {
        "type": "array",
        "items": {
            "type": "object",
            "required": [
                "id"
            ],
            "properties": {
                "id": {
                    "$ref": "#/definitions/numerical"
                },
                "header": {
                    "$ref": "#/definitions/header"
                }
            }
        }
    }
    

### 

External links

[](#external-links)

You can add two types of external links to a JSON panel – a link to **app settings** and an **external link** at the bottom of the global actions dropdown menu. As these links are added by extending the API response, the URLs and labels can be changed dynamically.

### 

App settings

[](#app-settings)

![1338](https://files.readme.io/5743bb0-c838c78-App_extensions_-_external_link_app_settings_-_Pipedrive.png)

External link – app settings

An external link to app settings is displayed under the actions menu on the top right-hand corner of the app panel. 

To add a link for app settings, you’d need to extend the API response by adding a settings object next to the data, as seen in the example code below. The settings object should contain the URL property of the link. 

JSON
    
    
    {
        "data": [ ... ],
        "settings": {
            "url": "https://google.com"
        }
    }
    

### 

External link – global actions

[](#external-link--global-actions)

The external link at the bottom of the global actions dropdown menu can be used to have an entrance link to your app right inside the JSON panel. You can add one `external_link` per JSON panel.

![1202](https://files.readme.io/90b31aa-d57d7e8-App_extensions_-_external_link_global_actions_-_Pipedrive.png)

External link – global actions

To add an external link for your app to the JSON panel’s footer, you will need to extend the API response by adding an `external_link` object next to the data, as seen in the example code below. The `label` property should be descriptive text in **sentence case** that explains to the user what happens when the link is clicked. The `label` property will be fully visible in 40 characters. After that, it’ll be truncated.

JSON
    
    
    {
        "data": [ ... ],
        "external_link": {
            "url": "https://google.com",
            "label": "Update billing"
        }
    }
    

Suppose your JSON panel has an app action(s) defined for [global actions](/docs/json-panels-actions-in-panels#global-actions). The external link will appear at the bottom of the global actions dropdown menu as the last action (see the image above).

If your JSON panel has no app actions defined for global actions, the external link will appear as a green button at the bottom of your app panel.

![1202](https://files.readme.io/6c70dfb-App_extensions_-_external_link_no_global_actions_-_Pipedrive.png)

External link without global actions

### 

Actions in panels

[](#actions-in-panels)

Once you have added a JSON file to Developer Hub with a JSON schema defining the JSON panel’s structure, you can add [various actions within the panel](/docs/json-panels-actions-in-panels).

App actions can be added for the entire panel/app, the object itself and individual fields. 

  


* * *

## 

Panel error handling

[](#panel-error-handling)

* * *

![1202](https://files.readme.io/6e5bc70-16d4c35-App_extensions_-_panel_error_handling_-_Pipedrive.png)

Interactive JSON panel error state

Your JSON panel can encounter different error scenarios when a user is using it. To show an interactive error state when an error happens, your app has to return a non-success status code (>`300`) with the following data:

Field| Description  
---|---  
`title` (required)| Descriptive, max 30 characters  
`subtitle` (optional)| A markdown field where you can add a longer message with links  
`action` (optional)| A call-to-action with URL and label fields  
  
JSON
    
    
    {
        "error": {
            "title": "Subscription expired",
            "subtitle": "Please [view your billing settings](https://pipedrive.com) or contact our customer support.",
            "action": {
                "url": "https://pipedrive.com",
                "label": "Renew subscription"
            }
        }
    }
    

  


* * *

## 

Templates

[](#templates)

* * *

### 

Example of multiple object panel

[](#example-of-multiple-object-panel)

To have a JSON panel containing multiple objects, you can refer the objects in the form of an array, where the fields of the JSON panel are defined in `properties`. All labels of fields should be in sentence case. For easy access to the sample panel, use [this template](https://raw.githubusercontent.com/pipedrive/example-apps/master/json-samples/app-panel-multiple-object.json) for defining your JSON schema for multiple object JSON panel.

JSON
    
    
    {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "id",
          "header"
        ],
        "properties": {
          "id": {
            "$ref": "#/definitions/numerical"
          },
          "header": {
            "$ref": "#/definitions/header"
          },
          "project": {
            "$ref": "#/definitions/text"
          },
          "manufacturer": {
            "$ref": "#/definitions/text"
          },
          "delivery_date": {
            "$ref": "#/definitions/date-time",
            "label": "Delivery date"
          },
          "status": {
            "$ref": "#/definitions/label"
          },
          "delivery_company": {
            "$ref": "#/definitions/text",
            "label": "Delivery company"
          },
          "tracking": {
            "$ref": "#/definitions/text"
          },
          "note": {
            "$ref": "#/definitions/text"
          },
          "extras": {
            "$ref": "#/definitions/tags"
          },
          "delivery_cost": {
            "$ref": "#/definitions/currency",
            "label": "Delivery cost"
          }
        }
      }
    }
    

The URL you add to Developer Hub should respond with the data received from the API and be structured as in the following example. If there’s no data or the value `null` sent back in the response for one property, this property’s data will be displayed as empty.

![960](https://files.readme.io/f3d189c-ad6ce06-App_panel_-_Pipedrive.png)

Multiple object JSON panel example

JSON
    
    
    {
        "data": [
            {
                "id": 1,
                "header": "GTA 22 Blue Auto",
                "project": "New cars",
                "manufacturer": "Molksvagen LLC",
                "delivery_date": "2021-08-31T07:00:00.000Z",
                "status": {
                    "color": "yellow",
                    "label": "ASSEMBLING"
                },
                "delivery_company": "Jungle Prime",
                "tracking": {
                    "markdown": true,
                    "value": "[Open tracking link](https://pipedrive.com)"
                },
                "note": {
                    "markdown": true,
                    "value": "Meeting next week to sign the [insurance contract](https://pipedrive.com)."
                },
                "extras": [
                    "Cruise control",
                    "Rain detector",
                    "Lane assist"
                ],
                "delivery_cost": {
                    "code": "USD",
                    "value": 2000
                }
            },
            {
                "id": 2,
                "header": "BNW X500",
                "project": "New cars",
                "manufacturer": "Molksvagen LLC",
                "delivery_date": "2021-08-31T07:00:00.000Z",
                "status": {
                    "color": "red",
                    "label": "DELAYED"
                },
                "delivery_company": "Jungle Prime",
                "tracking": {
                    "markdown": true,
                    "value": "[Open tracking link](https://pipedrive.com)"
                },
                "note": {
                    "markdown": true,
                    "value": "Meeting next week to sign the [insurance contract](https://pipedrive.com)."
                },
                "extras": [
                    "Cruise control",
                    "Rain detector",
                    "Lane assist"
                ],
                "delivery_cost": {
                    "code": "USD",
                    "value": 2000
                }
            },
            {
                "id": 3,
                "header": "Dorsche 911",
                "project": "New cars",
                "manufacturer": "Molksvagen LLC",
                "delivery_date": "2021-08-31T07:00:00.000Z",
                "status": {
                    "color": "green",
                    "label": "EN ROUTE"
                },
                "delivery_company": "Jungle Prime",
                "tracking": {
                    "markdown": true,
                    "value": "[Open tracking link](https://pipedrive.com)"
                },
                "note": {
                    "markdown": true,
                    "value": "Meeting next week to sign the [insurance contract](https://pipedrive.com)."
                },
                "extras": [
                    "Cruise control",
                    "Rain detector",
                    "Lane assist"
                ],
                "delivery_cost": {
                    "code": "USD",
                    "value": 2000
                }
            }
        ],
        "external_link": {
            "url": "https://pipedrive.com",
            "label": "Account settings"
        },
        "settings": {
            "url": "https://pipedrive.com"
        }
    }
    

The response should be empty when the JSON panel doesn’t have an entity tied to it on the app’s side. For example, when there’s no connection between a deal and a project on the app’s end, we'll only display an error message stating "Nothing to show" under the JSON panel’s name.

JSON
    
    
    {
      data: [
        ]
    }
    

![1202](https://files.readme.io/81c67b4-bd49bce-App_extensions_-_no_data_-_Pipedrive.png)

Empty state error message

### 

Example of single object JSON panel

[](#example-of-single-object-json-panel)

The JSON panel can also consist of only one object (see the code below). You can click here for the sample [template](https://raw.githubusercontent.com/pipedrive/example-apps/master/json-samples/app-panel-single-object.json) for defining your JSON schema for a single object JSON panel.

JSON
    
    
    {
        "type": "object",
        "required": [
            "id",
            "header"
        ],
        "properties": {
            "id": {
                "$ref": "#/definitions/numerical"
            },
            "header": {
                "$ref": "#/definitions/header"
            },
            "project": {
                "$ref": "#/definitions/text"
            },
            "manufacturer": {
                "$ref": "#/definitions/text"
            },
            "delivery_date": {
                "$ref": "#/definitions/date-time",
                "label": "Delivery date"
            },
            "status": {
                "$ref": "#/definitions/label"
            },
            "delivery_company": {
                "$ref": "#/definitions/text",
                "label": "Delivery company"
            },
            "tracking": {
                "$ref": "#/definitions/text"
            },
            "note": {
                "$ref": "#/definitions/text"
            },
            "extras": {
                "$ref": "#/definitions/tags"
            },
            "delivery_cost": {
                "$ref": "#/definitions/currency",
                "label": "Delivery cost"
            }
        }
    }
    

Example response:

JSON
    
    
    {
        "data": {
            "id": 1,
            "header": "GTA 22 Blue Auto",
            "project": "New cars",
            "manufacturer": "Molksvagen LLC",
            "delivery_date": "2021-08-31T07:00:00.000Z",
            "status": {
                "color": "yellow",
                "label": "ASSEMBLING"
            },
            "delivery_company": "Jungle Prime",
            "tracking": {
                "markdown": true,
                "value": "[Open tracking link](https://pipedrive.com)"
            },
            "note": {
                "markdown": true,
                "value": "Meeting next week to sign the [insurance contract](https://pipedrive.com)."
            },
            "extras": [
                "Cruise control",
                "Rain detector",
                "Lane assist"
            ],
            "delivery_cost": {
                "code": "USD",
                "value": 2000
            }
        }
    }
    

Also, note that the response should be empty when the JSON panel doesn’t have an entity tied to it on the app’s side. For example, when there’s no connection between a deal and a project on the app’s end, we’ll only display an error message stating **“Nothing to show“** under the JSON panel’s name.

JSON
    
    
    {
      data: {
      }
    }
    

__Updated 25 days ago

* * *

Read next

  * [Actions in JSON panels](/docs/json-panels-actions-in-panels)
  * [JSON panels](/docs/app-extensions-json-panels)


