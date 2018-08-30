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

    field :authevent, AuthEventType, null: true do
      description "Find events by ID"
      argument :id, ID, required: true
    end
    def authevent(id:) 
      AuthEvent.find(id)
    end

    field :authevents, [AuthEventType], null: true do
      description "Find events"
      argument :limit, Integer, required: false
    end
    def authevents(limit=30) 
      AuthEvent.last(limit)
    end
  end
end
