function textToBinary(text) {
  return text.split('').map(c =>
    c.charCodeAt(0).toString(2).padStart(8, '0')
  ).join('');
}

function binaryToText(binary) {
  let text = '';
  for (let i = 0; i < binary.length; i += 8) {
    let byte = binary.substr(i, 8);
    if (byte.length < 8) break;
    if (byte === "00000000") break;
    text += String.fromCharCode(parseInt(byte, 2));
  }
  return text;
}

function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString();
}

function encode() {
  const file = document.getElementById('encodeImageInput').files[0];
  const message = document.getElementById('message').value;
  const password = document.getElementById('password').value;

  if (!file || !message) {
    alert("Provide image and message");
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e) {
    const img = new Image();
    img.src = e.target.result;

    img.onload = function() {
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let data = imageData.data;

      const fullMessage = hashPassword(password) + "|" + message + "\0";
      const binary = textToBinary(fullMessage);

      if (binary.length > data.length) {
        alert("Message too large for this image!");
        return;
      }

      for (let i = 0; i < binary.length; i++) {
        data[i] = (data[i] & 254) | Number(binary[i]);
      }

      ctx.putImageData(imageData, 0, 0);

      const link = document.createElement('a');
      link.download = 'encoded.png';
      link.href = canvas.toDataURL();
      link.click();
    };
  };

  reader.readAsDataURL(file);
}

function decode() {
  const file = document.getElementById('decodeImageInput').files[0];
  const password = document.getElementById('decodePassword').value;
  const output = document.getElementById('output');

  if (!file) {
    alert("Provide image");
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e) {
    const img = new Image();
    img.src = e.target.result;

    img.onload = function() {
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let data = imageData.data;

      let binary = "";

      for (let i = 0; i < data.length; i++) {
        binary += (data[i] & 1);
      }

      const text = binaryToText(binary);
      const splitIndex = text.indexOf("|");

      if (splitIndex === -1) {
        output.innerText = "No hidden message found!";
        return;
      }

      const storedHash = text.substring(0, splitIndex);
      const message = text.substring(splitIndex + 1);

      if (storedHash !== hashPassword(password)) {
        output.innerText = "Wrong password!";
      } else {
        output.innerText = message.replace("\0", "");
      }
    };
  };

  reader.readAsDataURL(file);
}