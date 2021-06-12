import React, { useState, useEffect } from 'react';
import { Button, Image, Platform, StyleSheet, Text, View } from 'react-native';
import { withAuthenticator } from 'aws-amplify-react-native'
import * as ImagePicker from 'expo-image-picker'
import mime from 'mime-types'
import { RekognitionClient, CompareFacesCommand } from '@aws-sdk/client-rekognition';
import Amplify from '@aws-amplify/core'
import Storage from '@aws-amplify/storage'
import config from './src/aws-exports'

Amplify.configure(config)


function App() {
  const [image, setImage] = useState(null)
  const [fetchedImage, setFetchedImage] = useState(null)

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync()
        if (status !== 'granted') {
          alert(`Sorry, you have to enable camera roll permission to make it work`)
        }
      }
    })()
  }, [])

  const pickImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      base64: true,
      aspect: [4, 3],
      quality: 1,
    })

    console.log(result.uri)

    if (!result.cancelled) {
      setImage(result.uri)
    }

  }

  const handleImage = async () => {
    const imageName = image.replace(/^.*[\\\/]/, '')
    console.log(image)
    const fileType = mime.lookup(image)
    console.log("File Type: ", fileType)
    const access = { level: 'public', contentType: 'image/jpeg' }
    const imageData = await fetch(image)
    const blobData = await imageData.blob()

    try {
      await Storage.put(imageName, blobData, access)
    } catch (error) {
      console.log('Error ', error)
    }

    try {
      const signedURL = await Storage.get(imageName)
      console.log(signedURL)
      setFetchedImage(signedURL)
    } catch (error) {
      console.log('Error ', error)
    }
  }

  const listKeys = () => {
    Storage.list('') // for listing ALL files without prefix, pass '' instead
      .then(result => console.log(result))
      .catch(err => console.log(err));
  }


  /*
  const client = new RekognitionClient({ region: "REGION" })
  const params = {

  }
  const command = new CompareFacesCommand(params)

  try {
    const data = await client.send(command)
  } catch (error) {
    throw error
  } finally {
  }
  */

  return (
    <View style={styles.container}>
      <Button title="Take your picture" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
      {image && <Button title="Submit" onPress={handleImage} />}
      {fetchedImage && <Image source={{ uri: image }} style={{ width: 400, height: 400 }} />}
    </View>
  );
}

export default withAuthenticator(App, { includeGreetings: true })

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
