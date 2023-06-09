const commands =
{
    name: "fils",
    description: "Créer un thread",
    default_member_permissions: 0,
    options: [
        {
            "name": "title",
            "description": "Le nom de ton thread",
            "type": 3,
            "required": true
        }
    ]
};

module.exports = {
    data: commands
}