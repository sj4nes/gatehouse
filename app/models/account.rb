class Account < ApplicationRecord
    validates :username, presence: true
end
