import { View, StyleSheet, ImageSourcePropType, Platform} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useState, useRef, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from "react-native-view-shot";

// import html2canvas from "html2canvas";
import domtoimage from 'dom-to-image';

import ImageViewer from '@/components/ImageViewer';
import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import CircleButton from "@/components/CircleButton";
import EmojiPicker from "@/components/EmojiPicker";
import EmojiList from "@/components/EmojiList";
import EmojiSticker from "@/components/EmojiSticker";

const PlaceholderImage = require('@/assets/images/background-image.png');

export default function Index() {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [showAppOptions, setShowAppOptions] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [pickedEmoji, setPickedEmoji] = useState<ImageSourcePropType | undefined>(undefined);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const imageRef = useRef<View>(null);

  useEffect(() => {
    if (!permissionResponse?.granted) {
      requestPermission();
    }
  }, []);
  // if(permissionResponse === null) {
  //   requestPermission();
  // }

  // if (status === null) {
//   requestPermission();
// }

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setShowAppOptions(true);
      // console.log(result);
    }
    else {
      alert('You did not select any image.');
    }
  };

 const onReset = () => {
    setShowAppOptions(false);
 };

  const onAddSticker = () => {
      setIsModalVisible(true);
  };

  const onModalClose = () => {
    setIsModalVisible(false);
  };

  // const onSaveImageAsync = async () => {
  //   try {
  //     if (Platform.OS === 'web') {
  //       // @ts-ignore
  //       const element = imageRef.current?.containerRef?.current || imageRef.current;
  //       if (!element) return;

  //       const canvas = await html2canvas(element as HTMLElement);
  //       const dataUrl = canvas.toDataURL('image/png');

  //       const link = document.createElement('a');
  //       link.href = dataUrl;
  //       link.download = 'sticker-smash-screenshot.png';
  //       link.click();
  //       alert('Image Saved!');
  //     }else{
  //     const localUri = await captureRef(imageRef, {
  //       height: 440,
  //       quality: 1,
  //     });

  //     await MediaLibrary.saveToLibraryAsync(localUri);
  //     if (localUri) {
  //       alert('Screenshot Saved!');
  //     }
  //   }
  //   } catch (e) {
  //     console.log(e);
  //     alert('Failed to save the image. Please try again.');
  //   }

  // };

  // const [status, requestPermission] = MediaLibrary.usePermissions();

  const onSaveImageAsync = async () => {
    if (Platform.OS !== 'web') {
      try {
        const localUri = await captureRef(imageRef, {
          height: 440,
          quality: 1,
        });

        await MediaLibrary.saveToLibraryAsync(localUri);
        if (localUri) {
          alert('Screenshot Saved!');
        }
      } catch (e) {
        console.log(e);
        alert('Failed to save the image. Please try again.');
      }
    }
    else {
      try {
        if (!imageRef.current) {
          alert('No image to save.');
          return;
        }
        const dataUrl = await domtoimage.toJpeg(imageRef.current as unknown as Node, {
          width: 320,
          height: 440,
          quality: 0.95,
        });

        let link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'sticker-smash-screenshot.png';
        link.click();
        alert('Image Saved!');
      } catch (e) {
        console.log(e);
        alert('Failed to save the image. Please try again.');
      }
    }
  };
  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.imageContainer}>
        <View ref={imageRef} collapsable={false}>
        <ImageViewer imgSource={selectedImage || PlaceholderImage} />
        {pickedEmoji && (
          <EmojiSticker
            imageSize={40}
            stickerSource={pickedEmoji}
          />
        )}
        </View>
      </View>
      {showAppOptions ? (
        <View style={styles.optionsContainer}>
          <View style={styles.optionsRow}>
            <IconButton icon="refresh" label="Reset" onPress={onReset} />
            <CircleButton onPress={onAddSticker} />
            <IconButton icon="save-alt" label="Save" onPress={onSaveImageAsync} />
          </View>
        </View>
      ) : (
      <View style={styles.footerContainer}>
        <Button theme="primary" label="Choose a Photo" onPress={pickImageAsync}/>
        <Button label="Use this Photo" onPress={() => setShowAppOptions(true)}/>
      </View>
      )}
      <EmojiPicker isVisible={isModalVisible} onClose={onModalClose}>
        <EmojiList onSelect={setPickedEmoji} onCloseModal={onModalClose} />
      </EmojiPicker>
    </GestureHandlerRootView>
  );
}




const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    // justifyContent: 'center',
  },
  imageContainer: {
    flex: 1,
    paddingTop: 28,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
  optionsContainer: {
    position: 'absolute',
    bottom: 80,
  },
  optionsRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
})