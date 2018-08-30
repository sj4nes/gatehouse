require 'test_helper'

class LogControllerTest < ActionDispatch::IntegrationTest
  test "should get review" do
    get log_review_url
    assert_response :success
  end

end
