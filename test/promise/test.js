const delay = n => new Promise(resolve => setTimeout(resolve, n));

const promises = [
  delay(100).then(() => 1),
  delay(200).then(() => 2),
  delay(300).then(() => {
    throw new Error('Boom');
  }),
];

Promise.allDone = promises =>
  Promise.all(
    promises.map((promise, i) =>
      promise
        .then(value => ({
          status: 'fulfilled',
          value,
        }))
        .catch(reason => ({
          status: 'rejected',
          reason,
        }))
    )
  );

Promise.allDone(promises).then(res => {
  console.log(res);
});