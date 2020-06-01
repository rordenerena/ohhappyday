@startuml

enum PooType {
  NORMAL,
  SOFT,
  DIARRHEA,
  HARD
}

enum Mood {
  HAPPy,
  SAD,
  ANGRY,
  TIRED,
  ANNOY
}

enum RatingVal {
  GOOD,
  REGULAR,
  BAD
}

class Index {
  Number index
  String uuid
}

class Event {
  String title
  String description
}

class Tomorrow {
  Boolean nappy
  Boolean wipe
  Boolean clothes
  Boolean water
}

class Poo {
  Integer times
  PooType type
}

class Food {
    RatingVal breakfast
    RatingVal meal
    RatingVal snack
}

class Agenda {
  Date day
  Event event
  Dictionary<Number, AgendaItem> agendas;
}

class AgendaItem {
  Date date
  Event event
  Tomorrow tomorrow
  Mood mood
  Poo poo
  Food food
  String comment
}

class OneSignalKeys {
  String push
  String id
  String platform
}

class AesKeys {
  String secureKey
  String secureIV
}

class Centre extends Index {
  String name
  String tel
  String mail
}

class UserBase extends Index {
  String name
  String mail
  String picture
  OneSignalKeys push
  AesKeys aes
  String platform
}

class Follower extends UserBase {
  Number idOnTeacherApp
  String tel
  String relationship
}

class Teacher extends UserBase {

}

class ChildInfo extends Index {
  String name
  Date birthdate
  String picture
  Boolean deleted
}

class ChildInfoTeacher extends ChildInfo {
  Array<Follower> followers
}

class ChildInfoFollower extends ChildInfo {
  Teacher teacher
  Number indexForTeacher
}

UserBase *-- OneSignalKeys
UserBase *-- AesKeys

Agenda *-- Event 
Agenda *-- AgendaItem 

AgendaItem *-- Tomorrow
AgendaItem *-- Poo 
AgendaItem *-- Food 
@enduml