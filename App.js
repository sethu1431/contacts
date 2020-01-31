import React from "react";
import {
  StyleSheet,
  TextInput,
  Text,
  Image,
  View,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Linking,
  Platform,
  ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import * as Permissions from "expo-permissions";
import Modal from "react-native-modal";

export default class Contact extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
      contacts: [],
      isModalVisible: false,
      name: "",
      modelNumber: [],
      modelEmail:[],
      header: true,
      count: 0,
      value:""
    };
  }
  toggleModalTrue = (name, number, email) => {
    this.setState({ isModalVisible: true, name: name, modelNumber: number, modelEmail: email });
  };
  toggleModalFalse = () => {
    this.setState({ isModalVisible: false });
    this.setState({ name: "" });
  };

  dialCall = num => {
    let phoneNumber = null;
    if (Platform.OS === "android") {
      phoneNumber = `tel:${num}`;
    }
    Linking.openURL(phoneNumber);
  };

  loadContacts = async () => {
    const permission = await Permissions.askAsync(Permissions.CONTACTS);

    if (permission.status !== "granted") {
      return;
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails, Contacts.Fields.Image]
    });
    console.log('====================================');
    console.log(data);
    console.log('====================================');
    this.setState({ contacts: data, inMemoryContacts: data, isLoading: false });
  };

  searchContacts = value => {
    this.setState({value:value})
    const filteredContacts = this.state.inMemoryContacts.filter(contact => {
      let contactLowercase = (
        contact.firstName +
        ' ' +
        contact.lastName
      ).toLowerCase();

      let searchTermLowercase = value.toLowerCase();

      return contactLowercase.indexOf(searchTermLowercase) > -1;
    });
    this.setState({ contacts: filteredContacts });
  };

  componentDidMount() {
    this.setState({ isLoading: true, header: true });
    this.loadContacts();
  }
  componentWillUnmount(){
    console.log("df")
  }
  renderItem = item => {
    return (
      <TouchableOpacity
        onPress={() => {
          this.toggleModalTrue(item.name, item.phoneNumbers, item.emails);
        }}
      >
        <View style={styles.feedItem}>
          <Image
            source={require("./assets/person.png")}
            style={styles.avatar}
          ></Image>
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <View>
                <Text style={styles.name}>
                  {item.firstName + " "}
                  {item.middleName ? item.middleName + " " : null}
                  {item.lastName}
                </Text>
                {item.phoneNumbers ? (
                  item.phoneNumbers.map((ph, i) => {
                    return <Text style={styles.timestamp} key={i}> {ph.number} </Text>;
                  })
                ) : (
                  <Text style={styles.timestamp}>no number</Text>
                )}
                {item.emails
                  ? item.emails.map((email, i) => {
                      return (
                        <Text style={styles.timestamp} key={i}> {email.email} </Text>
                      );
                    })
                  : null}
              </View>
              <TouchableOpacity
                onPress={() => {
                  this.toggleModalTrue(item.name, item.phoneNumbers, item.emails);
                }}
              >
                <Ionicons name="md-call" size={23} color="#73788B" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content"></StatusBar>

        {this.state.header ? (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Contacts</Text>
            <TouchableOpacity onPress={()=> this.setState({header:false})} >
            <Ionicons name="md-search" size={23} color="#73788B" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.header}>
            <TextInput placeholder="Search" placeholderTextColor="#dddddd" value={this.state.value}  onChangeText={(value) => this.searchContacts(value)} />
            <TouchableOpacity onPress={()=> {return (this.componentDidMount())}} >
            <Ionicons name="md-close" size={23} color="#73788B" />
            </TouchableOpacity>
          </View>
        )}
        {this.state.isLoading ? (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              marginTop: 25
            }}
          >
            <ActivityIndicator size="large" color="blue" />
          </View>
        ) : (
          <FlatList
            style={styles.feed}
            data={this.state.contacts}
            renderItem={({ item }) => this.renderItem(item)}
            keyExtractor={item => item.id}
            initialNumToRender="15"
            ListEmptyComponent={() => (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 50
                }}
              >
                <Text style={{ color: "blue" }}>No Contacts Found</Text>
              </View>
            )}
          ></FlatList>
          )}
        
        
        <Modal
          animationIn="slideInDown"
          onBackdropPress={this.toggleModalFalse}
          onBackButtonPress={() => {
            this.toggleModalFalse();
          }}
          isVisible={this.state.isModalVisible}
        >
          <View style={{ flex: 1 }}>
            <View style={styles.feedItem}>
              <Image
                source={require("./assets/person.png")}
                style={styles.avatar}
              ></Image>
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <View>
                    <Text style={styles.name}>{this.state.name}</Text>
                    <Text style={styles.timestamp}>Call to</Text>
                    <ScrollView>
                      {this.state.modelNumber ? (
                        this.state.modelNumber.map((num, i) => {
                          return (
                            <TouchableOpacity
                              onPress={() => {
                                this.dialCall(num.number);
                              }}
                              key={i}
                            >
                              <View style={styles.modalBox}>
                                <Text style={styles.modalText}>
                                  {num.number}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })
                      ) : (
                        <Text>no number</Text>
                      )}
                      {this.state.modelEmail ? (
                        this.state.modelEmail.map((em, i) => {
                          return (
                          
                              <View style={styles.modalBox} key={i}>
                                <Text style={styles.modalText}>
                                  {em.email}
                                </Text>
                              </View>

                          );
                        })
                      ) : (
                      null 
                      )}
                    </ScrollView>
                  </View>

                  <TouchableOpacity onPress={this.toggleModalFalse}>
                    <Ionicons name="md-close" size={24} color="#73788B" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EBECF4"
  },
  header: {
    paddingTop: 55,
    paddingBottom: 16,
    paddingHorizontal: 18,
    backgroundColor: "#FFF",
    alignItems: "stretch",
    justifyContent: "space-between",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EBECF4",
    shadowColor: "#454D65",
    shadowOffset: { height: 5 },
    shadowRadius: 15,
    shadowOpacity: 0.2,
    zIndex: 10
  },
  search: {
    flexDirection: "row"
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "500"
  },
  feed: {
    marginHorizontal: 16
  },
  feedItem: {
    backgroundColor: "#FFF",
    borderRadius: 5,
    padding: 8,
    flexDirection: "row",
    marginVertical: 8
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 16
  },
  name: {
    fontSize: 15,
    fontWeight: "500",
    color: "#454D65"
  },
  timestamp: {
    fontSize: 11,
    color: "#C4C6CE",
    marginTop: 4
  },
  modalBox: {
    paddingTop: 16,
    paddingBottom: 5,
    backgroundColor: "#FFF",
    shadowColor: "#454D65",
    shadowOffset: { height: 5 },
    shadowRadius: 15,
    shadowOpacity: 0.2,
    zIndex: 10,
    borderBottomWidth: 1.2,
    borderBottomColor: "#EBECF4"
  },
  modalText: {}
});
