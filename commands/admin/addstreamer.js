const commands =
{
    name: "twitchping",
    description: "Permet d'ajouter un streamer au ping de pastille",
    default_member_permissions: 0,
    options: [
        {
            "name": "twitch_id",
            "description": "L'id du streamer",
            "type": 4,
            "required": true
        },
        {
            "name": "content",
            "description": "Le nom du streamer",
            "type": 3,
            "required": true
        }
    ]
};

module.exports = {
    data: commands
}