class CreateAuthEvents < ActiveRecord::Migration[5.1]
  def change
    create_table :auth_events do |t|
      t.references :account, foreign_key: true
      t.string :ipaddress

      t.timestamps
    end
  end
end
