
const nkey = require('nkey')
const omit = require('object.omit')
const Wallet = require('ethereumjs-wallet')
const type = 'ethereum'
const curve = 'secp256k1'
const UNCOMPRESSED_PREFIX = Buffer.from('04', 'hex')

const impl = nkey.wrapAPI({
  type,
  gen,
  genSync,
  fromJSON
})

module.exports = impl

function gen (opts, cb) {
  process.nextTick(function () {
    try {
      var key = genSync(opts)
    } catch (err) {
      return cb(err)
    }

    cb(null, key)
  })
}

function genSync (opts) {
  const wallet = Wallet.generate(opts.icapDirect)
  return impl.fromJSON({
    networkName: opts.networkName,
    priv: wallet.privKey,
    pub: Buffer.concat([UNCOMPRESSED_PREFIX, wallet.pubKey]),
    fingerprint: unprefixHex(wallet.getAddressString())
  })
}

function fromJSON (json) {
  const priv = toHexBuffer(json.priv)
  const pub = toHexBuffer(json.pub)
  const privKeyString = toHexString(json.priv)
  const pubKeyString = toHexString(json.pub)
  const fingerprint = json.fingerprint
  return nkey.wrap({
    type,
    pub,
    priv,
    pubKeyString,
    fingerprint,
    toJSON: function toJSON (exportPrivate) {
      const obj = {
        type,
        curve,
        pub: pubKeyString,
        fingerprint,
        networkName: json.networkName
      }

      if (exportPrivate) obj.priv = privKeyString

      return obj
    }
  })
}

function toHexBuffer (val) {
  return Buffer.isBuffer(val) ? val : Buffer.from(val, 'hex')
}

function toHexString (val) {
  return Buffer.isBuffer(val) ? val.toString('hex') : val
}

function unprefixHex (val) {
  return val.slice(0, 2) === '0x' ? val.slice(2) : val
}
