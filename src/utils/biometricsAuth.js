import * as LocalAuthentication from 'expo-local-authentication'

const biometricsAuth = async () => {
  const compatible = await LocalAuthentication.hasHardwareAsync()

  if (!compatible) {
    throw 'This device is not compatible for biometric authentication'
  }

  const enrolled = await LocalAuthentication.isEnrolledAsync()

  if (!enrolled) {
    throw `This device doesn't have biometric authentication enabled`
  }

  const result = await LocalAuthentication.authenticateAsync()
  if (!result.success) {
    throw `${result.error} - Authentication unsuccessful`
  } else console.log(`Success!`)
  console.log(result)

  return result
}

export default biometricsAuth