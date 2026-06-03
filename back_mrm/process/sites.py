from .base import Process


class SiteProcess(Process):
    def __init__(self, filename, name="Site"):
        super().__init__(filename, name)
