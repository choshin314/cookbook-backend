# Cookbook Backend

This is the backend for Cookbook, a site/app for creating recipes and saving other peoples' recipes, with some social media(-ish?) features.  All API-related stuff + postgres table & index definitions

#### Related Links
[Cookbook Frontend](https://github.com/choshin314/cookbook-frontend)
[Cookbook Live Site](https://cookbookshare.com)

#### Notes/Required Services

* PORT = port number
* DB_CONNECTION = connection URI for db
* CLOUDINARY_URL = required URL for Cloudinary SDK
* ACCESS_TOKEN_SECRET = secret key for signing/verifying access JWTs
* REFRESH_TOKEN_SECRET = samesies as above but for refresh JWTs