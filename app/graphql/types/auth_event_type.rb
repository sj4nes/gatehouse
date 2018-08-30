class Types::AuthEventType < Types::BaseObject
    description "An authentication event object"
    field :id, ID, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :ipaddress, String, null: true
    # field :endpoint, String, "Where the authentication was sourced from, typically IPv4 etc."
    # This is purely for demonstration-- I would like to also think that external systems can log into the gatehouse.
    # field :account, Account, "Who was being authenticated?"
    # field :system, String, "What was being accessed?"
    # field :result, String, "Whether or not it was successful"
end
