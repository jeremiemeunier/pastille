const commands =
{
    name: "statut",
    description: "Permet de définir le statut du bot",
    default_member_permissions: 0,
    options: [
        {
            "name": "content",
            "description": "Ton statut",
            "type": 3,
            "required": true
        }
    ]
};

module.exports = {
    data: commands
}