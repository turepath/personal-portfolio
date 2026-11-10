'''
number = int(input())
number_text = 0
in_nb = str(input())


def simplify(sample):
    change_nb = sample.split("/")
    judge = 1
    nb1 = int(change_nb[0])
    nb2 = int(change_nb[1])
    while (judge == 1 and nb1 != 0):
        if nb1 % 2 == 0 and nb2 % 2 == 0:
            nb1 = int(nb1 / 2)
            nb2 = int(nb2 / 2)
        elif nb1 % 3 == 0 and nb2 % 3 == 0:
            nb1 = int(nb1 / 3)
            nb2 = int(nb2 / 3)
        else:
            break
            judge = 0

    if nb1 > 0 and nb2 > 0 and nb2 != -1 and nb2 != 1:
        print(f"{nb1}/{nb2}")
    elif nb1 < 0 and nb2 < 0 and nb2 != -1 and nb2 != 1:
        print(f"{-nb1}/{-nb2}")
    elif nb1 > 0 and nb2 < 0 and nb2 != -1 and nb2 != 1:
        print(f"-{nb1}/{-nb2}")
    elif nb1 < 0 and nb2 > 0 and nb2 != -1 and nb2 != 1:
        print(f"{nb1}/{nb2}")
    elif nb2 == 1:
        print(f"{nb1}")
    elif nb2 == -1:
        print(f"-{nb1}")
    elif nb1 == 0:
        print(0)
    judge = 1


while number_text < number:
    simplify(in_nb)
    in_nb = str(input())
    number_text += 1
'''
number = int(input())
number_text = 0
sentence = str(input())
alphabet = {'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U',
            'V', 'W', 'X', 'Y', 'Z'}


def brief(a):
    words = a.split()
    for word in words:
        match.append(b for b in alphabet if word in alphabet)
    final_match = "".join(match)
    print(final_match)
    none = set()
    final_match = none
    match = none


while number_text < number:
    sentence = str(input())
    number_text += 1
