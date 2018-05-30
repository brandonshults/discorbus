module.exports = Object.freeze({
  commandKey: '!',
  whiteList: {
    roles: [
      { name: 'Noxian Extraordinaire', id: '402162558200578048' },     // Nox Main Server
      { name: 'Friends of Nox', id: '402163922649481226' },            // Nox Main Server
      { name: 'Tester', id: '418270718510366749' },                    // Discorbus Testing Server
      { name: 'ARCer', id: '415691466451451914' }                      // ARC
    ]
  },
  // How often the Trickster chest spawns, in hours
  tricksterChestRespawnRate: 10,
  // Alert times (in minutes) before the trickster chest spawns
  tricksterChestAlertTimes: [ 60, 30, 10, 1 ]
});
