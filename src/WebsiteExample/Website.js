import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Button,
  TouchableOpacity,
  Image,
} from 'react-native';
import { createSwitchNavigator } from '../react-navigation-core';

const colors = {
  bg: '#FFF3EB',
  link: '#4987F9',
  title: '#4E6F9D',
  highlight: '#FECF0A33',
};

const LogoText = () => (
  <Text
    style={{
      fontSize: 64,
      color: colors.title,
      fontFamily: 'Shrikhand',
      marginVertical: 25,
    }}
  >
    ono
  </Text>
);

const EmailLink = ({ children, to }) => (
  <TouchableOpacity
    onPress={() => {
      window.location = `mailto:${to}`;
    }}
  >
    <Text
      style={{ fontSize: 24, color: colors.link, fontFamily: 'ArbutusSlab' }}
    >
      {children}
    </Text>
  </TouchableOpacity>
);

const Main = () => (
  <View
    style={{
      flex: 1,
      overflow: 'hidden',
      justifyContent: 'center',
      flexDirection: 'row',
    }}
  >
    <View
      style={{
        position: 'absolute',
        bottom: '50%',
        left: 0,
        right: 0,
        top: 0,
        backgroundColor: colors.highlight,
      }}
    />
    <View
      style={{
        ...StyleSheet.absoluteFillObject,
        left: 100,
        right: -50,
        top: -50,
        bottom: -50,
      }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-around',
        }}
      >
        <Image
          style={{
            flex: 1,
            maxWidth: 2000,
            minWidth: 1000,
            resizeMode: 'contain',
            minHeight: 950,
          }}
          source={require('./ono-shapes.svg')}
        />
      </View>
    </View>
    <View
      style={{
        maxWidth: 600,
        flex: 1,
        paddingTop: 100,
        paddingBottom: 200,
        paddingHorizontal: 30,
        justifyContent: 'center',
      }}
    >
      <LogoText />
      <View
        style={{
          flexWrap: 'wrap',
          flexDirection: 'row',
          marginVertical: 20,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            color: colors.title,
            fontFamily: 'ArbutusSlab',
          }}
        >
          dine &amp; dash /{' '}
        </Text>
        <Text
          style={{
            fontSize: 24,
            color: colors.title,
            fontFamily: 'ArbutusSlab',
          }}
        >
          coming 2019
        </Text>
      </View>
      <EmailLink to="aloha@onofood.co">say aloha →</EmailLink>
      <View style={{ flex: 1, maxHeight: '50%' }} />
    </View>
  </View>
);

const fontsCSS = `
@font-face {
  src: url('/fonts/Shrikhand-Regular.otf.otf');
  font-family: Shrikhand;
}
@font-face {
  src: url('/fonts/ArbutusSlab-Regular.ttf');
  font-family: ArbutusSlab;
}
`;

Main.navigationOptions = {
  backgroundColor: colors.bg,
  title: 'ono food co',
  customCSS: fontsCSS,
};

const App = createSwitchNavigator({
  Main,
});

export default App;
