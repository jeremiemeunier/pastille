const commands =
{
  name: "clear",
  description: "Clear all of this channel",
  default_member_permissions: 0,
  options: [
    {
      name: "thread",
      description: "Clear all thread in this channel",
      type: 1
    },
    {
      name: "messages",
      description: "Clear all messages in this channel",
      type: 1
    }
  ]
};

module.exports = {
    data: commands
}