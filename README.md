# Platform.sh Activity Scripts

This repository provides a set of Platform.sh activity scripts useful for any projects.

## Script list:

- **github/env_url.js**: creates a Github Status providing the first URL of a new deployed environnement


## How to use the script

```
curl ${URLOFTHESCRIPT} --output script.js
platform integration:add --type script --file ./script.js --events event1,event2,event3
rm script.js
```


## Scripts

### github/env_url.js

This script needs information about your GITHUB repository, so you need to create a project variable on Platform.sh

```json
{
    "owner": "YourLogin", 
    "repository": "YourRepo", 
    "token": "YourToken"    
}
```

The project variable MUST be `env:GITHUB_AUTH` and should be set as sensitive. 

Then you can install it

```json
curl https://raw.githubusercontent.com/Plopix/platformsh-activity-scripts/master/github/env_url.js --output script.js
platform integration:add --type script --file ./script.js --events environment.redeploy --states="pending,in_progress,complete"
rm script.js
```

![github/env_url.js result](./screenshots/env_url.png)

## LICENCE


[MIT](LICENSE)
