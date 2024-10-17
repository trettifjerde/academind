function connectDatabase() {
  // side effect, ok
  const didConnect = database.connect();
  if (didConnect) {
    return true;
  } else {
    //side effect, arguably ok
    console.log('Could not connect to database!');
    return false;
  }
}

function determineSupportAgent(ticket) {
  let agent;
  if (ticket.requestType === 'unknown') {
    agent = findStandardAgent();
  }
  else {
    agent = findAgentByRequestType(ticket.requestType);
  }
  return agent;
}

function isValid(email, password) {
  if (!email.includes('@') || password.length < 7) {
    //side effect, not ok
    console.log('Invalid input!');
    return false;
  }
  return true;
}