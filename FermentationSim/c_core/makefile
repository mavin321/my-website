CC = gcc
CFLAGS = -O3 -fPIC -Iinclude
LDFLAGS = -shared
TARGET = libfermentation.so

SRC = src/fermentation_model.c src/rk4_solver.c

all: $(TARGET)

$(TARGET): $(SRC)
	$(CC) $(CFLAGS) $(SRC) -o $(TARGET) $(LDFLAGS)

clean:
	rm -f $(TARGET) *.o
