function handleNewUserData(userData) {
  try {
    createUser(userData);
  }
  catch (error) {
    showError(error.message);
  }
}

function createUser(userData) {
  if (!isUserDataValid(userData))
    throw new Error('Invalid input');

  database.insert(userData)
}

function isUserDataValid({email, password}) {
  return isEmailValid(email) && isPasswordValid(password);
}

function isValidEmail(email) {
  return email && email.includes('@');
}

function isValidPassword(password) {
  return password && password.trim();
}

function showError(message) {
  console.log(message);
}