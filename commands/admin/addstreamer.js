const commands =
{
    name: "twitchping",
    description: "Toutes les commandes liée aux pings des streamers",
    default_member_permissions: 0,
    options: [
        {
            "name": "add",
            "description": "Ajouter un streamer aux pings",
            "type": 1,
            options: [
                {
                    "name": "twitch_id",
                    "description": "Id twitch du streamer",
                    "type": 4,
                    "required": true
                },
                {
                    "name": "twitch_name",
                    "description": "Le nom du streamer",
                    "type": 3,
                    "required": true
                },
                {
                    "name": "discord_id",
                    "description": "Id discord du streamer",
                    "type": 4,
                    "required": false
                },
                {
                    "name": "discord_name",
                    "description": "Le pseudo discord du streamer",
                    "type": 3,
                    "required": false
                }
            ]
        },
        {
            "name": "remove",
            "description": "Supprimer un streamer des pings",
            "type": 1,
            "options": [
                {
                    "name": "twitch_name",
                    "description": "Le pseudo twitch du streamer",
                    "type": 3,
                    "required": true
                }
            ]
        },
        {
            "name": "list",
            "description": "Liste les streamer qui sont ping",
            "type": 1
        }
    ]
};

module.exports = {
    data: commands
}