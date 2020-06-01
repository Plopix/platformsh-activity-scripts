/**
 * Platform.sh Activity Script that creates a Github Status providing the first URL of a new deployed environnement
 *
 * Usage: Setup a project variable: env:GITHUB_AUTH with a JSON value:
 *
 * env:GITHUB_AUTH={"owner": "YourLogin", "repository": "YourRepo", "token": "YourToken"}
 *
 * Quick note: set that project variable as sensitive.
 *
 * @author    Sébastien Morel aka Plopix <morel.seb@gmail.com>
 * @license   MIT
 */
try {
    var GITHUB_AUTH = activity.payload.deployment.variables.reduce(function (accumulator, variable) {
        return (variable.name === 'GITHUB_AUTH') ? JSON.parse(variable.value) : accumulator;
    }, false);

    if (
        typeof activity !== 'undefined' &&
        activity.result === 'success' &&
        activity.payload.environment.status === 'active'
    ) {
        var routes = Object.keys(activity.payload.deployment.routes);
        if (routes.length > 0) {
            var body = {
                state: activity.state === "success" ? activity.state : "pending",
                target_url: routes[0],
                description: "Deploy on Platform.sh succeeded!",
                context: "continuous-integration/platform.sh"
            };
            var response = fetch("https://api.github.com/repos/" + GITHUB_AUTH.owner + "/" + GITHUB_AUTH.repository + "/statuses/" + activity.payload.environment.head_commit, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'token ' + GITHUB_AUTH.token,
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                console.log("Creating new status for new deploy did not work: " + response.body.text());
            }
        }
    }
} catch (exception) {
    console.log("An exception has been thrown: " + exception.message);
}
