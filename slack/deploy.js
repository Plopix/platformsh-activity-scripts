/**
 * Platform.sh Activity Script that send a Message to a slack channel
 *
 * Usage: Setup a project variable: SLACK_URL with a string value
 *
 * Quick note: set that project variable as sensitive.
 *
 * @author    Sébastien Morel aka Plopix <morel.seb@gmail.com>
 * @license   MIT
 */
var blockTypes = {
    divider: function () {
        return {
            "type": "divider"
        }
    },
    text: function (text) {
        return {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": text,
            }
        }
    },
    fields: function (fields) {
        return {
            "type": "section",
            "fields": fields.map(function (field) {
                return {
                    "type": "mrkdwn",
                    "text": "*" + field.label + "*" + ": " + field.text
                }
            }),
        }
    },
    elements: function (elements) {
        return {
            "type": "context",
            "elements": elements.map(function (elt) {
                return elt;
            })
        }
    }
};

try {
    if (typeof activity.payload.deployment === 'undefined') {
        console.log("Deployment payload (and therefore Variables) is unavailable in this state: " + activity.state);
    } else {
        var SLACK_URL = activity.payload.deployment.variables.reduce(function (accumulator, variable) {
            return (variable.name === 'SLACK_URL') ? variable.value : accumulator;
        }, false);

        if (activity.payload.environment.status === 'active' && SLACK_URL !== false) {

            var environment = activity.payload.environment;
            var fields = [
                {
                    label: "Robots.txt Protection",
                    text: environment.restrict_robots ? "ON" : "OFF"
                },
                {
                    label: "HTTP Auth",
                    text: environment.http_access.is_enabled ? "ON" : "OFF"
                },
                {
                    label: "SMTP Enabled",
                    text: environment.enable_smtp ? "ON" : "OFF"
                },
                {
                    label: "Production?",
                    text: activity.payload.deployment.environment_info.is_production ? "YES" : "NO"
                },
            ];

            var user = activity.payload.user;
            var routes = activity.payload.deployment.routes;
            var route = Object.keys(activity.payload.deployment.routes).reduce(function (accumulator, key) {
                return (routes[key].primary) ? key : accumulator;
            }, routes[0] || false);


            var isSuccess = activity.result === 'success';
            var blocks = [];
            blocks.push(blockTypes.text(isSuccess ? "An environment based on *" + environment.name + "* has been deployed." : activity.text));
            blocks.push(blockTypes.fields(fields));

            if (isSuccess && route !== false) {
                blocks.push(blockTypes.divider());
                if ((new Date).getDay() === 5) {
                    var images = [
                        'https://media.giphy.com/media/b23a67ZhemOe4/giphy.gif',
                        'https://media.giphy.com/media/4Z3DdOZRTcXPa/giphy.gif',
                        'https://media3.giphy.com/media/YRPVlInmP08agsbXQR/giphy.gif?cid=ecf05e4775c582b0fbbf1aba87efb897d6a2d60613b20329&rid=giphy.gif',
                        'https://media1.giphy.com/media/26tP7Lltx6BaMhKfK/giphy.gif?cid=ecf05e47e73b9addd06cfd55ef878043ae01cafebcdfa30f&rid=giphy.gif',
                        'https://media2.giphy.com/media/3P0sH1unGUinC/giphy.gif?cid=ecf05e47834ed0830c62b584441d6fef6e1e29af4e7abe16&rid=giphy.gif'

                    ];
                    blocks.push({
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "*You deployed on Friday! Congratulations!*\n" + "You can visit this environment following this url: " + route
                        },
                        "accessory": {
                            "type": "image",
                            "image_url": images[Math.floor(Math.random() * images.length)],
                            "alt_text": "Deployed on Friday!"
                        }
                    });
                } else {
                    blocks.push(blockTypes.text("You can visit this environment following this url: " + route));
                }

            }
            blocks.push(blockTypes.elements([
                {
                    "type": "image",
                    "image_url": "https://platform.sh/images/favicon/favicon.ico",
                    "alt_text": "Platform.sh"
                },
                {
                    "type": "mrkdwn",
                    "text": "*" + user.display_name + "* has started it on " + activity.started_at
                }
            ]));

            blocks.push(blockTypes.divider());
            blocks.push(blockTypes.text(activity.log.substr(activity.log.length - 3000)));

            var response = fetch(SLACK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "text": activity.text,
                    "attachments": [
                        {
                            "color": isSuccess ? '#2EB67D' : '#FF0000',
                            "blocks": blocks.map(function (block) {
                                return block;
                            })
                        }
                    ]
                }),
            });

            if (!response.ok) {
                console.log("Posting to Slack did not work: " + response.body.text());
            }
        }
    }
} catch (exception) {
    console.log("An exception has been thrown: " + exception.message);
}

