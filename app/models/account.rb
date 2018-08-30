class Account < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :trackable
  def after_database_authentication
    signin = AuthEvent.new
    signin.account = self
    signin.ipaddress = self.current_sign_in_ip
    signin.save
  end 
end
