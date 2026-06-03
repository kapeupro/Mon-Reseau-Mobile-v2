from back_mrm.utils.text import remove_file_extension


class Process:
    def __init__(
        self,
        filename,
        name="Base",
    ):
        self.message_fail = ""
        self.message_running = "Préparation du fichier..."
        self.message_warning = " WARNING : This is an abstract class. You must create a subclass of Process."

        self.filename = filename
        self.filename_raw = remove_file_extension(self.filename)

        self.name = name
        self.running_percent = 0
        self.step = 1
        self.success = True

    def run(self):
        self.start()

        self.run_step1()

        self.ask_confirmation()

        self.run_step2()

        if self.success:
            self.end()

    def run_step1(self):
        pass

    def run_step2(self):
        pass

    def next_step(self):
        self.step = 2
        self.message_running = "Préparation des données..."
        self.running_percent = 0

    def start(self):
        print("START")

    def end(self):
        print("END")

    def fail(self, message):
        self.message_running = "Echec"
        self.message_fail = message
        self.success = False
        self.end()

    def ask_confirmation(self):
        confirm = str(input("Confirm data ? (Y/N) :"))
        confirm = confirm.lower() == "y"

        if confirm:
            self.next_step()
        else:
            self.fail("Annulation du processus par l'utilisateur.")

    def __str__(self):
        string = f"Process ({self.name}) -> {self.filename}"

        if self.name == "Base":
            string += f" {self.message_warning}"

        return string
