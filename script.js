function openLocation(address = "13 Timothy Lane Rumuola, Port Harcourt, Rivers State") {
    const formattedAddress = address.replace(/ /g, '+');
  window.open(`https://www.google.com/maps/search/?api=1&query=${formattedAddress}`, '_blank');
}