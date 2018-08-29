class Types::AccountType < Types::BaseObject
    description "A object representing the account"
    field :id, ID, null: false
    field :email, String, "The e-mail address used to authenticate", null: false
end