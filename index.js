import fetch from 'node-fetch';
import { utils } from 'ethers';
import { readFile } from 'fs'

const isRegistered = async (x) => {
  const hash = utils.keccak256(utils.toUtf8Bytes(x));

  try{
    const res = await fetch("https://api.thegraph.com/subgraphs/name/ensdomains/ens", {
      "headers": {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/json",
        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"100\", \"Google Chrome\";v=\"100\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "Referer": "https://app.ens.domains/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      "body": "{\"operationName\":\"getRegistrantFromSubgraph\",\"variables\":{\"id\":\"" + hash + "\"},\"query\":\"query getRegistrantFromSubgraph($id: ID!) {\\n  registration(id: $id) {\\n    id\\n    domain {\\n      name\\n      __typename\\n    }\\n    registrant {\\n      id\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\"}",
      "method": "POST"
    });
    const json = await res.json();

    return json.data.registration !== null;
  } catch (e) {
    return false;
  }

}

const BATCH_SIZE = 10

const dictionary = async n => {
  readFile(`./data/${n}.txt`, 'utf-8', async (err, data) => {
    const words = data.split('\n')
    for (let i = 0; i < words.length; i+= BATCH_SIZE) {
      const batch = []
      for (let j = 0; j < BATCH_SIZE; j++) {
        const word = words[i+j].slice(0, -1) // remove extra character
        batch.push(isRegistered(word.toLocaleLowerCase()))
      }
      const ress = await Promise.all(batch)
      for (let j = 0; j < BATCH_SIZE; j++) {
        if (!ress[j]) console.log(words[i+j])
      }
    }
  })
}

const alph = "abcdefghijklmnopqrstuvwxyz"
const letters3 = async () => {
  for (const y of alph) {
    for (const z of alph) {
      const batch = []
      for (const w of alph) {
        const l = y+z+w
        batch.push(isRegistered(l))
      }
      const res = await Promise.all(batch)
      for (let j = 0; j < alph.length; j++) {
        if (!res[j]) console.log(y+z+alph[j])
      }
    }
  }
}

const digits = async () => {
  for (let i = 100; i < 10000; i+=BATCH_SIZE) {
    const batch = []
    for (let j = 0; j < BATCH_SIZE; j++) {
      batch.push(isRegistered(i+j + ""))
    }
    const ress = await Promise.all(batch)
    for (let j = 0; j < BATCH_SIZE; j++) {
      if (!ress[j]) console.log(i+j)
    }
  }
}

// dictionary(3); // all gone :(
dictionary(4);
// dictionary(5);

// letters3(); // all gone :(

// digits(); // all gone :(
