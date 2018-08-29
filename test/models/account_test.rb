require 'test_helper'

class AccountTest < ActiveSupport::TestCase
  test "shouldn't be able to write an account without username" do
    badAccount = Account.new
    assert_not badAccount.save
  end
  test "save account with username" do
    okAccount = Account.new
    okAccount.username = 'admin'
    assert okAccount.save
  end
  # test "the truth" do
  #   assert true
  # end
end
