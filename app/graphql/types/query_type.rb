module Types
  class QueryType < Types::BaseObject
    # Add root-level fields here.
    # They will be entry points for queries on your schema.

    field :account, AccountType, null: true do
      description "Find an account by ID"
      argument :id, ID, required: true
    end
    def account(id:)
      Account.find(id)
    end
  end
end
