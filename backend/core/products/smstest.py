# works with both python 2 and 3
from __future__ import print_function

import africastalking


class SMS:
    def __init__(self):
        # Set your app credentials
        self.username = "Broadsword"
        self.api_key = "atsk_72d61e3848972cd267992534249db913b137db44834c209c793fd0654e73dddb76837866"

        # Initialize the SDK
        africastalking.initialize(self.username, self.api_key)

        # Get the SMS service
        self.sms = africastalking.SMS

    def send(self):
        # Set the numbers you want to send to in international format
        recipients = ["+254706839313"]

        # Set your message
        message = "Im testing the code to make sure it works well. "

        # Set your shortCode or senderId
        sender = "AFTKNG"
        try:
            # Thats it, hit send and we'll take care of the rest.
            response = self.sms.send(message, recipients, sender)
            print(response)
        except Exception as e:
            print("Encountered an error while sending: %s" % str(e))


if __name__ == "__main__":
    SMS().send()
