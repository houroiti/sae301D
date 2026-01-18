<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use App\Entity\Reservation;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Routing\Annotation\Route;

class ReservationApiController extends AbstractController
{
    #[Route('/reservation/create', name: 'reservation_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        // Récupérer le JSON envoyé par le front
        $data = json_decode($request->getContent(), true);

        if (!$data || !is_array($data)) {
            return $this->json([
                'success' => false,
                'message' => 'Données manquantes ou JSON invalide'
            ], 400);
        }

        // Validation des champs obligatoires
        $requiredIdentity = ['lastName', 'firstName', 'email'];
        foreach ($requiredIdentity as $field) {
            if (empty($data['identity'][$field])) {
                return $this->json([
                    'success' => false,
                    'message' => "Champ identité manquant : $field"
                ], 400);
            }
        }

        if (empty($data['date']) || empty($data['time'])) {
            return $this->json([
                'success' => false,
                'message' => "Date ou heure manquante"
            ], 400);
        }

        // Calcul des nombres
        $sessionDuration = intval($data['duration'] ?? 60);
        $priceSession = floatval($data['price'] ?? 0);

        $optionsPrice = 0;
        if (!empty($data['options']) && is_array($data['options'])) {
            foreach ($data['options'] as $option) {
                $optionsPrice += floatval($option['price'] ?? 0);
            }
        }

        $total = floatval($data['total'] ?? ($priceSession + $optionsPrice));

        // Création des objets DateTime avec try/catch
        try {
            $start = new \DateTime($data['date'] . 'T' . $data['time']);
            $end = (clone $start)->add(new \DateInterval('PT' . $sessionDuration . 'M'));
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Date ou heure invalide'
            ], 400);
        }


        // Création de la réservation
        $reservation = new Reservation();
        $reservation->setNomClient($data['identity']['lastName']);
        $reservation->setPrenomClient($data['identity']['firstName']);
        $reservation->setEmailClient($data['identity']['email']);
        $reservation->setTelephoneClient($data['identity']['phone'] ?? null);
        $reservation->setAdresseClient($data['address']['street'] ?? '');
        $reservation->setComplementAdresse($data['address']['complement'] ?? '');
        $reservation->setVilleClient($data['address']['city'] ?? '');
        $reservation->setTypeLogement($data['address']['housingType'] ?? '');
        $reservation->setEtage(intval($data['address']['floor'] ?? 0));
        $reservation->setAscenseur(!empty($data['address']['hasElevator']) ? 1 : 0);
        $reservation->setInfosAcces($data['address']['accessInfo'] ?? '');
        $reservation->setParking($data['address']['parking'] ?? '');
        $reservation->setLat($data['address']['lat'] ?? null);
        $reservation->setLng($data['address']['lng'] ?? null);
        $reservation->setDiscipline($data['discipline'] ?? '');
        $reservation->setSessionType($data['sessionType'] ?? '');
        $reservation->setDateDebut($start);
        $reservation->setDateFin($end);
        $reservation->setDureeMinutes($sessionDuration);
        $reservation->setFrequence($data['frequency'] ?? 'unique');
        $reservation->setOptions(json_encode($data['options'] ?? []));
        $reservation->setPrixSession($priceSession);
        $reservation->setPrixOptions($optionsPrice);
        $reservation->setTotal($total);
        $reservation->setStatus('paid'); // si paiement OK
        $reservation->setDateCreation(new \DateTime());

        // gestions d’erreurs
        try {
            $em->persist($reservation);
            $em->flush();
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Impossible d’enregistrer la réservation'
            ], 500);
        }

        return $this->json([
            'success' => true,
            'message' => 'Réservation enregistrée avec succès',
            'reservationId' => $reservation->getId()
        ]);
    }
    #[Route('/reservation/list', name: 'reservation_list', methods: ['GET'])]
    public function list(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $date = $request->query->get('date'); // format YYYY-MM-DD
        if (!$date) {
            return $this->json([
                'success' => false,
                'message' => 'Date manquante'
            ], 400);
        }

        try {
            $startOfDay = new \DateTime($date . ' 00:00:00');
            $endOfDay   = new \DateTime($date . ' 23:59:59');
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Date invalide'
            ], 400);
        }

        $reservations = $em->getRepository(Reservation::class)->createQueryBuilder('r')
            ->where('r.dateDebut BETWEEN :start AND :end')
            ->setParameter('start', $startOfDay)
            ->setParameter('end', $endOfDay)
            ->getQuery()
            ->getResult();

        $reservedSlots = [];
        foreach ($reservations as $reservation) {
            $resStart = clone $reservation->getDateDebut();
            $resEnd   = clone $reservation->getDateFin();

            // Arrondir start à l'inférieur et end au supérieur multiples de 15 min
            $startMinutes = intval($resStart->format('i'));
            $endMinutes   = intval($resEnd->format('i'));
            $resStart->setTime((int)$resStart->format('H'), floor($startMinutes / 15) * 15, 0);
            $resEnd->setTime((int)$resEnd->format('H'), ceil($endMinutes / 15) * 15, 0);

            $reservedSlots[] = [
                'start' => $resStart->format('Y-m-d H:i:s'),
                'end'   => $resEnd->format('Y-m-d H:i:s')
            ];
        }

        return $this->json([
            'success' => true,
            'reservedSlots' => $reservedSlots
        ]);
    }

}
