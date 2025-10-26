# GET /itemSearch/field

> **Operation ID:** `searchItemByField`
> **Tags:** `ItemSearch`

## Perform a search using a specific field from an item type

Performs a search from the values of a specific field. Results can either be the distinct values of the field (useful for searching autocomplete field values), or the IDs of actual items (deals, leads, persons, organizations or products).

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `term` | string | query | Yes | The search term to look for. Minimum 2 characters (or 1 if `match` is `exact`). Please note that the search term has to be URL encoded. |
| `entity_type` | string (`deal`, `lead`, `person`, ...) | query | Yes | The type of the field to perform the search from |
| `match` | string (`exact`, `beginning`, `middle`) | query | No | The type of match used against the term. The search <b>is</b> case sensitive.<br/><br/> E.g. in case of searching for a value `monkey`, <ul> <li>with `exact` match, you will only find it if term is `monkey`</li> <li>with `beginning` match, you will only find it if the term matches the beginning or the whole string, e.g. `monk` and `monkey`</li> <li>with `middle` match, you will find the it if the term matches any substring of the value, e.g. `onk` and `ke`</li> </ul>. |
| `field` | string | query | Yes | The key of the field to search from. The field key can be obtained by fetching the list of the fields using any of the fields' API GET methods (dealFields, personFields, etc.). Only the following custom field types are searchable: `address`, `varchar`, `text`, `varchar_auto`, `double`, `monetary` and `phone`. Read more about searching by custom fields <a href="https://support.pipedrive.com/en/article/search-finding-what-you-need#searching-by-custom-fields" target="_blank" rel="noopener noreferrer">here</a>. |
| `limit` | integer | query | No | For pagination, the limit of entries to be returned. If not provided, 100 items will be returned. Please note that a maximum value of 500 is allowed. |
| `cursor` | string | query | No | For pagination, the marker (an opaque string value) representing the first item on the next page |

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: search:read