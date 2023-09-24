import axios from 'axios';


const form = document.querySelector('form')! as HTMLFormElement;
form.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.getElementById('address')! as HTMLInputElement;
    const address = input.value.trim();
    if (address) {
        axios.get('')
            .then(

            )
            .catch()
    }
});