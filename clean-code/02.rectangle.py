class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y


class Rectangle:
    def __init__(self, starting_point, width, height):
        self.starting_point = starting_point
        self.width = width
        self.height = height

    def get_area(self):
        return self.width * self.height

    def print_coordinates(self):
        end_point = Point(
            self.starting_point.x + self.width,
            self.starting_point.y + self.height
        )
        print('Starting Point (X)): ' + str(self.starting_point.x))
        print('Starting Point (Y)): ' + str(self.starting_point.y))
        print('End Point X-Axis (Top Right): ' + str(end_point.x))
        print('End Point Y-Axis (Bottom Left): ' + str(end_point.y))


rect = Rectangle(Point(50, 100), 90, 10)
print('Area: ' + str(rect.get_area()))
rect.print_coordinates()