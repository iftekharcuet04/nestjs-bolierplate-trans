# Custom Response Handler

In this project, `returnSuccess` and `returnError` handle responses. `returnSuccess` returns a success response with a 200 status code, and `returnError` returns an error response with a 400 status code. The `ResponseInterceptor` is used to catch errors and throw them to the `CustomExceptionFilter`.

The `CustomExceptionFilter` is used to handle any errors in the application.

**The message translation**
 depends on request headers Accept-Language such as `en`, `es`

## Handling Validation Errors

It uses the `validation` property of the error to check if the error is a validation error. If it is, it uses the `key_message` property to replace the default error message with a custom message from the `translation.json` file. If the `key_message` property is not provided, it uses the `NOT_EMPTY_MESSAGE` key as the default key.

The `message` property of the decorator takes priority over the `key_message` property. If the `message` property is provided, it will be used as the error message. If not, it will use the custom message from the `translation.json` file that matches the `key_message` property. It will be used as the key to look up the custom message in the `translation.json` file with values defined at the field-validator.ts being used as the variable to replace the custom message.

### Validation Example 1

1. Use message for custom message without variables:

   ```typescript
   @CustomIsString({
       message: "TYPE_MISMATCH_ERROR"
   })
   name: string;
   ```

2. Use message for custom message with variables:

   ```typescript
   @CustomIsString({
       message: JSON.stringify({
           key: "TYPE_MISMATCH_ERROR",
           fieldName: "name",
           expectedType: "string",
           invalidType: "non string"
       })
   })
   name: string;
   ```

If defined like above, even if `key_message` is added, the translation for "TYPE_MISMATCH_ERROR" will be shown. Following explains about `key_message`:

For example, if the error is a validation error with a `key_message` property of `"TYPE_MISMATCH_CUSTOM"`, the `translation.json` file will be looked up with the key `TYPE_MISMATCH_CUSTOM` and the value of the key will be used as the error message. If the `key_message` property is not provided, it will use the `TYPE_MISMATCH_CUSTOM` key as the default key.

### Validation Example 2

```typescript
@CustomIsString({
    key_message: "TYPE_MISMATCH_CUSTOM"
})
name: string;
```

This returns with `fieldName`, `expectedType`, `invalidType` so it will be replaced in the custom message from `translation.json`. For this to work, the key should be present.

## Custom Response Message in API

The key "TYPE_MISMATCH_CUSTOM" in `translation.json` should be like `"TYPE_MISMATCH_CUSTOM": "{{fieldName}} expected to be {{expectedType}}, but got {{invalidType}}"`.

For `returnSuccess` and `returnError`, the `extraData` property is used to pass additional data to the response. The `pagination` property is used to pass pagination data to the response. The custom message is used to replace the default error message with a custom message from the `translation.json` file. For example:



## In GraphQL

The process of handling validation errors is slightly different. For handling validation error context, use `CustomErrorHandlingPlugin`.


**Note**: In this project I also provide some example, how to handle message centrally.
 Any one can see the swagger(post man) for rest api and apollo server for GraphQL api. 