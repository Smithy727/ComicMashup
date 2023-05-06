// // Import the firebase object from your sketch.js file
// import { firebase } from './sketch.js';

// function displayImagesFromFirebase() {
//   const storageRef = firebase.storage().ref();
//   const imageGrid = document.querySelector('.image-grid');

//   storageRef.listAll().then((res) => {
//     res.items.forEach((imageRef, index) => {
//       imageRef.getDownloadURL().then((url) => {
//         const imageContainer = document.createElement('div');
//         imageContainer.className = 'panel-image-container';
//         const img = document.createElement('img');
//         img.src = url;
//         img.alt = `Example ${index - 1}`;
//         imageContainer.appendChild(img);
//         imageGrid.appendChild(imageContainer);
//       });
//     });
//   });
// }

// // Call the displayImagesFromFirebase() function
// displayImagesFromFirebase();
