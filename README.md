# Cookbook Backend

This is the backend for Cookbook, a site/app for creating recipes and saving other peoples' recipes, with some social media(-ish?) features.  All API-related stuff + postgres table & index definitions

#### Related Links

* [Cookbook Frontend](https://github.com/choshin314/cookbook-frontend)
* [Cookbook Live Site](https://cookbookshare.com)

#### Required Env Variables

* PORT = port number
* DATABASE_URL = connection URI for db
* CLOUDINARY_URL = required URL for Cloudinary SDK
* ACCESS_TOKEN_SECRET = secret key for signing/verifying access JWTs
* REFRESH_TOKEN_SECRET = samesies as above but for refresh JWTs

#### Misc

Copyright 2021, Shin Cho, All rights reserved.
